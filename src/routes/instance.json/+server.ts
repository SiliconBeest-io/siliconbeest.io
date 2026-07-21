import { json } from '@sveltejs/kit';
import registry from '../../../instance.json';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () =>
	json(registry, {
		headers: {
			'cache-control': 'public, max-age=300, s-maxage=3600',
			'access-control-allow-origin': '*'
		}
	});
