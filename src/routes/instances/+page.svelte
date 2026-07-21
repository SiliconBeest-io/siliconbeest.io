<script lang="ts">
	import {
		registrationLabel,
		registryRepository,
		statusLabel,
		type InstanceStatus,
		type ListedSiliconBeestInstance,
		type RegistrationMode
	} from '$lib/instances';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let { data } = $props();
	type LiveMetadata = {
		registration: ListedSiliconBeestInstance['registration'];
		apiUrl: string;
		description: string;
		languages: string[];
		sourceUrl: string | null;
		thumbnailUrl: string | null;
		available: boolean;
	};

	let liveMetadata = $state<Record<string, LiveMetadata>>({});
	let metadataLoaded = $state(false);
	let instances = $derived<ListedSiliconBeestInstance[]>(
		data.instances.map((instance) => {
			const metadata = liveMetadata[instance.domain];
			return {
				...instance,
				description: metadata?.available
					? metadata.description || 'No description provided by this instance.'
					: metadataLoaded
						? 'Instance description is currently unavailable.'
						: 'Loading instance description…',
				languages:
					metadata?.available && Array.isArray(metadata.languages) ? metadata.languages : [],
				sourceUrl: metadata?.sourceUrl ?? null,
				thumbnailUrl: metadata?.thumbnailUrl ?? null,
				registration: metadata?.registration ?? (metadataLoaded ? 'unavailable' : 'loading'),
				apiUrl: metadata?.apiUrl ?? instance.uri ?? new URL('/api/v2/instance', instance.url).href,
				metadataStatus: metadata?.available
					? 'available'
					: metadataLoaded
						? 'unavailable'
						: 'loading'
			};
		})
	);
	let query = $state('');
	let status = $state<'all' | InstanceStatus>('all');
	let registration = $state<'all' | RegistrationMode>('all');
	let liveLanguageCount = $derived(new Set(instances.flatMap((item) => item.languages)).size);

	let filteredInstances = $derived(
		instances.filter((instance) => {
			const search =
				`${instance.name} ${instance.domain} ${instance.description} ${instance.languages.join(' ')}`.toLowerCase();
			return (
				search.includes(query.toLowerCase()) &&
				(status === 'all' || instance.status === status) &&
				(registration === 'all' || instance.registration === registration)
			);
		})
	);

	function useBrandFallback(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		if (!image.src.endsWith('/brand/siliconbeest.png')) {
			image.src = '/brand/siliconbeest.png';
		}
	}

	onMount(async () => {
		try {
			const response = await fetch(resolve('/api/instances/metadata'));
			if (!response.ok) throw new Error('Instance metadata lookup failed');

			const payload = (await response.json()) as {
				instances?: Array<{
					domain: string;
					registration: ListedSiliconBeestInstance['registration'];
					api_url: string;
					description: string;
					languages: string[];
					source_url: string | null;
					thumbnail_url: string | null;
					available: boolean;
				}>;
			};
			liveMetadata = Object.fromEntries(
				(payload.instances ?? []).map(
					({ domain, api_url, source_url, thumbnail_url, ...metadata }) => [
						domain,
						{
							...metadata,
							apiUrl: api_url,
							sourceUrl: source_url,
							thumbnailUrl: thumbnail_url
						}
					]
				)
			);
		} catch {
			// The derived card state switches to unavailable when the request completes.
		} finally {
			metadataLoaded = true;
		}
	});
</script>

<svelte:head>
	<title>Instances — SiliconBeest</title>
	<meta
		name="description"
		content="Discover public SiliconBeest instances or submit your own instance to the community directory."
	/>
</svelte:head>

<section class="instances-page">
	<div class="aurora aurora-one"></div>
	<div class="aurora aurora-two"></div>
	<div class="page-width instances-hero">
		<div>
			<p class="section-kicker">INSTANCE DIRECTORY</p>
			<h1>Find your place<br /><span class="gradient-text">in the fediverse.</span></h1>
			<p>
				Browse community-run SiliconBeest instances. Every entry is reviewed through a pull request
				and managed from one public registry.
			</p>
		</div>
		<div class="registry-summary" aria-label="Instance directory summary">
			<div>
				<strong>{instances.length}</strong><span
					>listed instance{instances.length === 1 ? '' : 's'}</span
				>
			</div>
			<div>
				<strong
					>{metadataLoaded
						? instances.filter((item) => item.registration === 'open').length
						: '—'}</strong
				><span>open registration</span>
			</div>
			<div>
				<strong>{metadataLoaded ? liveLanguageCount : '—'}</strong><span
					>reported language{metadataLoaded && liveLanguageCount !== 1 ? 's' : ''}</span
				>
			</div>
			<a href={resolve('/instance.json')} target="_blank" rel="noreferrer">View instance.json ↗</a>
		</div>
	</div>
</section>

<section class="instance-directory page-width section-space">
	<div class="instance-toolbar">
		<label class="instance-search">
			<span aria-hidden="true">⌕</span>
			<input bind:value={query} type="search" placeholder="Search by name, domain, or language" />
		</label>
		<label>
			<span>Status</span>
			<select bind:value={status}>
				<option value="all">All statuses</option>
				<option value="production">Production</option>
				<option value="active">Active</option>
				<option value="development">Development</option>
				<option value="maintenance">Maintenance</option>
			</select>
		</label>
		<label>
			<span>Registration</span>
			<select bind:value={registration}>
				<option value="all">All modes</option>
				<option value="open">Open</option>
				<option value="approval">Approval required</option>
				<option value="referral">Referral required</option>
				<option value="closed">Closed</option>
			</select>
		</label>
	</div>

	<div class="instance-results-heading">
		<div>
			<span class="live-dot"></span><strong
				>{filteredInstances.length} result{filteredInstances.length === 1 ? '' : 's'}</strong
			>
		</div>
		<small>Registry schema v1 · reviewed entries</small>
	</div>

	<div class="instance-grid" aria-live="polite">
		{#each filteredInstances as instance (instance.domain)}
			<article class="instance-card">
				<div class="instance-card-visual">
					<img
						src={instance.thumbnailUrl ?? '/brand/siliconbeest.png'}
						alt=""
						loading="lazy"
						onerror={useBrandFallback}
					/>
					<div class="instance-badges">
						<span
							class:development={instance.status === 'development'}
							class:maintenance={instance.status === 'maintenance'}
						>
							<i></i>{statusLabel(instance.status)}
						</span>
						{#if instance.featured}<span class="featured-badge">Featured</span>{/if}
					</div>
				</div>
				<div class="instance-card-body">
					<div class="instance-title-row">
						<div>
							<h2>{instance.name}</h2>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={instance.url} target="_blank" rel="noreferrer">{instance.domain} ↗</a>
						</div>
						<img src="/brand/icon-512.png" alt="" />
					</div>
					<p>{instance.description}</p>
					<div class="instance-facts">
						<span
							><small>REGISTRATION</small><strong>{registrationLabel(instance.registration)}</strong
							></span
						>
						<span
							><small>LANGUAGES</small><strong
								>{instance.languages.length > 0
									? instance.languages.join(' · ').toUpperCase()
									: instance.metadataStatus === 'loading'
										? 'Checking languages…'
										: 'Languages unavailable'}</strong
							></span
						>
					</div>
					<div class="instance-actions">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a class="button button-primary" href={instance.url} target="_blank" rel="noreferrer"
							>Visit instance <span>↗</span></a
						>
						{#if instance.sourceUrl}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={instance.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>
						{:else}
							<span class="source-unavailable">Source unavailable</span>
						{/if}
					</div>
				</div>
			</article>
		{/each}
		{#if filteredInstances.length === 0}
			<div class="instance-empty">
				<span>⌕</span>
				<h2>No instances found</h2>
				<p>Try a broader search or reset the filters.</p>
			</div>
		{/if}
	</div>
</section>

<section class="registry-contribute page-width section-space">
	<div class="registry-contribute-panel">
		<div>
			<p class="section-kicker light">RUN SILICONBEEST?</p>
			<h2>Add your instance<br />through a pull request.</h2>
			<p>
				Fork the directory repository, add one validated entry to <code>instance.json</code>, and
				open a pull request for review.
			</p>
		</div>
		<ol>
			<li>
				<span>01</span>
				<div>
					<strong>Fork</strong>
					<p>Create a branch in your fork.</p>
				</div>
			</li>
			<li>
				<span>02</span>
				<div>
					<strong>Edit</strong>
					<p>Add your entry to instance.json.</p>
				</div>
			</li>
			<li>
				<span>03</span>
				<div>
					<strong>Validate</strong>
					<p>Run the registry checks locally.</p>
				</div>
			</li>
			<li>
				<span>04</span>
				<div>
					<strong>Submit</strong>
					<p>Open a pull request for review.</p>
				</div>
			</li>
		</ol>
		<div class="registry-contribute-actions">
			<a class="button button-light" href={resolve('/docs/[slug]', { slug: 'instance-directory' })}
				>Submission guide <span>→</span></a
			>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={`${registryRepository}/compare`} target="_blank" rel="noreferrer"
				>Open a pull request ↗</a
			>
		</div>
	</div>
</section>
