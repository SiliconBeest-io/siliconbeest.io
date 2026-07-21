import { json } from '@sveltejs/kit';
import schema from '../../../instance.schema.json';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () =>
	json(schema, {
		headers: {
			'cache-control': 'public, max-age=300, s-maxage=3600',
			'access-control-allow-origin': '*'
		}
	});
