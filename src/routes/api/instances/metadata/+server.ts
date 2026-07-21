import { instances, resolveInstanceMetadata } from '$lib/server/instance-registry';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300'
	});

	const resolved = await Promise.all(
		instances.map((instance) => resolveInstanceMetadata(instance, fetch))
	);

	return json({
		instances: resolved.map(
			({
				domain,
				registration,
				apiUrl,
				description,
				languages,
				sourceUrl,
				thumbnailUrl,
				metadataStatus
			}) => ({
				domain,
				registration,
				api_url: apiUrl,
				description,
				languages,
				source_url: sourceUrl,
				thumbnail_url: thumbnailUrl,
				available: metadataStatus === 'available'
			})
		)
	});
};
