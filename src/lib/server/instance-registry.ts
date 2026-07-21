import registry from '../../../instance.json';
import type {
	ListedSiliconBeestInstance,
	RegistrationMode,
	SiliconBeestInstance
} from '$lib/instances';

const registrationModes = new Set<RegistrationMode>(['open', 'approval', 'referral', 'closed']);

export const instances = registry.instances as SiliconBeestInstance[];

export function registrationEndpoint(instance: SiliconBeestInstance): string {
	return instance.uri ?? new URL('/api/v2/instance', instance.url).href;
}

export async function resolveInstanceMetadata(
	instance: SiliconBeestInstance,
	fetcher: typeof fetch
): Promise<ListedSiliconBeestInstance> {
	const apiUrl = registrationEndpoint(instance);
	let registration: ListedSiliconBeestInstance['registration'] = 'unavailable';
	let description = '';
	let languages: string[] = [];
	let sourceUrl: string | null = null;
	let thumbnailUrl: string | null = null;
	let metadataStatus: ListedSiliconBeestInstance['metadataStatus'] = 'unavailable';

	try {
		const response = await fetcher(apiUrl, {
			headers: { accept: 'application/json' },
			signal: AbortSignal.timeout(4_000)
		});
		if (response.ok) {
			const payload = (await response.json()) as {
				description?: unknown;
				languages?: unknown;
				source_url?: unknown;
				thumbnail?: { url?: unknown };
				registrations?: { mode?: unknown };
			};
			metadataStatus = 'available';
			if (typeof payload.description === 'string') description = payload.description.trim();
			if (Array.isArray(payload.languages)) {
				languages = [
					...new Set(
						payload.languages.filter(
							(language): language is string =>
								typeof language === 'string' &&
								language.length <= 35 &&
								/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(language)
						)
					)
				];
			}
			if (typeof payload.source_url === 'string') {
				try {
					const parsedSourceUrl = new URL(payload.source_url);
					if (parsedSourceUrl.protocol === 'https:') sourceUrl = parsedSourceUrl.href;
				} catch {
					// Invalid source URLs are omitted from the public directory.
				}
			}
			if (typeof payload.thumbnail?.url === 'string') {
				try {
					const parsedThumbnailUrl = new URL(payload.thumbnail.url);
					if (parsedThumbnailUrl.protocol === 'https:') thumbnailUrl = parsedThumbnailUrl.href;
				} catch {
					// Invalid thumbnail URLs fall back to the SiliconBeest brand image.
				}
			}
			if (
				typeof payload.registrations?.mode === 'string' &&
				registrationModes.has(payload.registrations.mode as RegistrationMode)
			) {
				registration = payload.registrations.mode as RegistrationMode;
			}
		}
	} catch {
		// A directory entry remains useful even while its live API is unreachable.
	}

	return {
		...instance,
		description,
		languages,
		sourceUrl,
		thumbnailUrl,
		registration,
		apiUrl,
		metadataStatus
	};
}
