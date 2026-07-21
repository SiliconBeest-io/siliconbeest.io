export const CONTACT_CATEGORIES = [
	'project',
	'contribution',
	'operations',
	'security',
	'other'
] as const;
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export type ContactInput = {
	name: string;
	email: string;
	category: ContactCategory;
	subject: string;
	message: string;
	website: string;
};

export type ValidationResult = { ok: true; value: ContactInput } | { ok: false; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function validateContactInput(input: unknown): ValidationResult {
	if (!input || typeof input !== 'object') {
		return { ok: false, message: 'Please check the information you entered.' };
	}

	const record = input as Record<string, unknown>;
	const name = readText(record.name);
	const email = readText(record.email).toLowerCase();
	const category = readText(record.category);
	const subject = readText(record.subject);
	const message = readText(record.message);
	const website = readText(record.website);

	if (website) return { ok: false, message: 'Please check the information you entered.' };
	if (name.length < 2 || name.length > 80)
		return { ok: false, message: 'Your name must be between 2 and 80 characters.' };
	if (email.length > 254 || !emailPattern.test(email))
		return { ok: false, message: 'Enter a valid email address.' };
	if (!CONTACT_CATEGORIES.includes(category as ContactCategory))
		return { ok: false, message: 'Select a topic.' };
	if (subject.length < 3 || subject.length > 120)
		return { ok: false, message: 'The subject must be between 3 and 120 characters.' };
	if (message.length < 20 || message.length > 5000)
		return { ok: false, message: 'The message must be between 20 and 5,000 characters.' };

	return {
		ok: true,
		value: { name, email, category: category as ContactCategory, subject, message, website }
	};
}

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

export function categoryLabel(category: ContactCategory): string {
	return {
		project: 'Project question',
		contribution: 'Contribution and development',
		operations: 'Deployment and operations',
		security: 'Security report',
		other: 'Other'
	}[category];
}

export function buildContactEmail(input: ContactInput, requestId: string): EmailMessageBuilder {
	const label = categoryLabel(input.category);
	const safeName = escapeHtml(input.name);
	const safeEmail = escapeHtml(input.email);
	const safeSubject = escapeHtml(input.subject);
	const safeMessage = escapeHtml(input.message).replaceAll('\n', '<br />');

	return {
		to: 'siliconsjang@gmail.com',
		from: { email: 'contact@siliconbeest.io', name: 'SiliconBeest Hub' },
		replyTo: { email: input.email, name: input.name },
		subject: `[SiliconBeest · ${label}] ${input.subject}`,
		text: [
			`A new message arrived from the SiliconBeest Hub.`,
			'',
			`Topic: ${label}`,
			`Name: ${input.name}`,
			`Reply-to: ${input.email}`,
			`Subject: ${input.subject}`,
			`Request ID: ${requestId}`,
			'',
			input.message
		].join('\n'),
		html: `
			<div style="font-family:Inter,system-ui,sans-serif;max-width:640px;margin:0 auto;color:#172033">
				<div style="padding:24px;border-radius:18px 18px 0 0;background:linear-gradient(120deg,#4f46e5,#a855f7);color:#fff">
					<div style="font-size:12px;letter-spacing:.12em;opacity:.8">SILICONBEEST PROJECT HUB</div>
					<h1 style="font-size:22px;margin:8px 0 0">A new message has arrived.</h1>
				</div>
				<div style="padding:24px;border:1px solid #e4e7f2;border-top:0;border-radius:0 0 18px 18px">
					<table style="width:100%;border-collapse:collapse;font-size:14px">
						<tr><td style="padding:8px 0;color:#64748b;width:100px">Topic</td><td style="padding:8px 0;font-weight:600">${label}</td></tr>
						<tr><td style="padding:8px 0;color:#64748b">Name</td><td style="padding:8px 0">${safeName}</td></tr>
						<tr><td style="padding:8px 0;color:#64748b">Reply-to</td><td style="padding:8px 0">${safeEmail}</td></tr>
						<tr><td style="padding:8px 0;color:#64748b">Subject</td><td style="padding:8px 0">${safeSubject}</td></tr>
					</table>
					<div style="margin-top:20px;padding:18px;border-radius:12px;background:#f6f7fb;line-height:1.7">${safeMessage}</div>
					<p style="margin:20px 0 0;color:#94a3b8;font-size:12px">Request ID: ${requestId}</p>
				</div>
			</div>`
	};
}
