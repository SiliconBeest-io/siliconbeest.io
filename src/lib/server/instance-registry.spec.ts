import { describe, expect, it } from 'vitest';
import type { SiliconBeestInstance } from '$lib/instances';
import { registrationEndpoint, resolveInstanceMetadata } from './instance-registry';

const instance: SiliconBeestInstance = {
	name: 'Example Social',
	domain: 'example.social',
	url: 'https://example.social',
	status: 'active'
};

describe('instance registration resolver', () => {
	it('derives the v2 instance endpoint from url', () => {
		expect(registrationEndpoint(instance)).toBe('https://example.social/api/v2/instance');
	});

	it('prefers an explicit uri', () => {
		expect(
			registrationEndpoint({
				...instance,
				uri: 'https://example.social/api/v2/instance'
			})
		).toBe('https://example.social/api/v2/instance');
	});

	it('accepts all four SiliconBeest registration modes', async () => {
		for (const mode of ['open', 'approval', 'referral', 'closed'] as const) {
			const fetcher = async () =>
				new Response(JSON.stringify({ registrations: { mode } }), {
					status: 200,
					headers: { 'content-type': 'application/json' }
				});

			await expect(resolveInstanceMetadata(instance, fetcher)).resolves.toMatchObject({
				registration: mode
			});
		}
	});

	it('marks invalid responses as unavailable', async () => {
		const fetcher = async () =>
			new Response(JSON.stringify({ registrations: { mode: 'invite-only' } }), { status: 200 });

		await expect(resolveInstanceMetadata(instance, fetcher)).resolves.toMatchObject({
			registration: 'unavailable',
			metadataStatus: 'available'
		});
	});

	it('reads description, languages, source_url, and thumbnail from the live API', async () => {
		const fetcher = async () =>
			new Response(
				JSON.stringify({
					description: 'A live description from the instance.',
					languages: ['ko', 'en', 'ko'],
					source_url: 'https://github.com/example/example.social',
					thumbnail: { url: 'https://example.social/thumbnail.png' },
					registrations: { mode: 'approval' }
				}),
				{ status: 200 }
			);

		await expect(resolveInstanceMetadata(instance, fetcher)).resolves.toMatchObject({
			description: 'A live description from the instance.',
			languages: ['ko', 'en'],
			sourceUrl: 'https://github.com/example/example.social',
			thumbnailUrl: 'https://example.social/thumbnail.png',
			metadataStatus: 'available'
		});
	});

	it('omits invalid language tags instead of guessing', async () => {
		const fetcher = async () =>
			new Response(JSON.stringify({ languages: ['en', '', 'not a language', 42] }), {
				status: 200
			});

		await expect(resolveInstanceMetadata(instance, fetcher)).resolves.toMatchObject({
			languages: ['en'],
			metadataStatus: 'available'
		});
	});
});
