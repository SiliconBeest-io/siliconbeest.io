import { instances } from '$lib/server/instance-registry';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ instances });
