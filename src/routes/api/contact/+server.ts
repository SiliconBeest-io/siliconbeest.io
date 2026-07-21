import { json } from '@sveltejs/kit';
import { WorkerMailer } from 'worker-mailer';
import type { RequestHandler } from './$types';
import { buildContactEmail, validateContactInput } from '$lib/server/contact';

const MAX_BODY_BYTES = 16_384;

async function rateLimitKey(request: Request): Promise<string> {
	const encoder = new TextEncoder();
	const fingerprint = `${request.headers.get('cf-connecting-ip') ?? 'local'}|${request.headers.get('user-agent') ?? 'unknown'}`;
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(fingerprint));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function readBoundedJson(
	request: Request
): Promise<{ ok: true; value: unknown } | { ok: false; tooLarge: boolean }> {
	if (!request.body) return { ok: false, tooLarge: false };

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > MAX_BODY_BYTES) {
				await reader.cancel();
				return { ok: false, tooLarge: true };
			}
			chunks.push(value);
		}

		const body = new Uint8Array(total);
		let offset = 0;
		for (const chunk of chunks) {
			body.set(chunk, offset);
			offset += chunk.byteLength;
		}
		return { ok: true, value: JSON.parse(new TextDecoder().decode(body)) };
	} catch {
		return { ok: false, tooLarge: false };
	}
}

export const POST: RequestHandler = async ({ request, url, platform }) => {
	const requestId = crypto.randomUUID();
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin) {
		return json({ ok: false, message: 'This request is not allowed.' }, { status: 403 });
	}

	if (!request.headers.get('content-type')?.startsWith('application/json')) {
		return json({ ok: false, message: 'This request format is not supported.' }, { status: 415 });
	}

	const contentLength = Number(request.headers.get('content-length') ?? 0);
	if (contentLength > MAX_BODY_BYTES) {
		return json({ ok: false, message: 'The message is too long.' }, { status: 413 });
	}

	const smtp = {
		host: platform?.env.SMTP_HOST,
		port: Number(platform?.env.SMTP_PORT ?? 587),
		username: platform?.env.SMTP_USERNAME,
		password: platform?.env.SMTP_PASSWORD
	};
	if (!smtp.host || !smtp.username || !smtp.password || !platform?.env.CONTACT_RATE_LIMITER) {
		return json(
			{ ok: false, message: 'Email delivery is not available yet. Please try again shortly.' },
			{ status: 503 }
		);
	}

	const key = await rateLimitKey(request);
	const limit = await platform.env.CONTACT_RATE_LIMITER.limit({ key });
	if (!limit.success) {
		return json(
			{ ok: false, message: 'Too many requests. Please wait a moment and try again.' },
			{ status: 429, headers: { 'Retry-After': '60' } }
		);
	}

	const parsedBody = await readBoundedJson(request);
	if (!parsedBody.ok && parsedBody.tooLarge) {
		return json({ ok: false, message: 'The message is too long.' }, { status: 413 });
	}
	if (!parsedBody.ok) {
		return json(
			{ ok: false, message: 'We could not read the submitted information.' },
			{ status: 400 }
		);
	}

	const validation = validateContactInput(parsedBody.value);
	if (!validation.ok) {
		return json({ ok: false, message: validation.message }, { status: 422 });
	}

	try {
		await WorkerMailer.send(
			{
				host: smtp.host,
				port: smtp.port,
				secure: smtp.port === 465,
				startTls: smtp.port !== 465,
				credentials: { username: smtp.username, password: smtp.password },
				authType: ['plain', 'login']
			},
			buildContactEmail(validation.value, requestId)
		);
		console.log(
			JSON.stringify({
				event: 'contact_email_sent',
				requestId,
				category: validation.value.category
			})
		);
		return json({ ok: true, message: 'Your message has been sent.', requestId }, { status: 201 });
	} catch (error) {
		const code = error instanceof Error && 'code' in error ? String(error.code) : 'UNKNOWN';
		console.error(JSON.stringify({ event: 'contact_email_failed', requestId, code }));
		return json(
			{ ok: false, message: 'We could not send the email. Please try again shortly.', requestId },
			{ status: 502 }
		);
	}
};
