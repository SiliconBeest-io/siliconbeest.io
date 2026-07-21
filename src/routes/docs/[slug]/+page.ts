import { error } from '@sveltejs/kit';
import { findDoc } from '$lib/docs';

export function load({ params }) {
	const doc = findDoc(params.slug);
	if (!doc) error(404, 'Document not found.');
	return { doc };
}
