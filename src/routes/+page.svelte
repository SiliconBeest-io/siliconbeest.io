<script lang="ts">
	import { docs, featuredDocs } from '$lib/docs';
	import { resolve } from '$app/paths';

	let query = $state('');
	let filteredDocs = $derived(
		docs.filter((doc) =>
			`${doc.category} ${doc.title} ${doc.description}`.toLowerCase().includes(query.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>SiliconBeest</title>
</svelte:head>

<section class="hero">
	<div class="aurora aurora-one"></div>
	<div class="aurora aurora-two"></div>
	<div class="hero-grid page-width">
		<div class="hero-copy">
			<h1>Your fediverse,<br /><span class="gradient-text">light and resilient.</span></h1>
			<p>
				SiliconBeest is an ActivityPub server built on Cloudflare Workers. Connect Mastodon apps,
				share reactions with Misskey, and run across the global edge without a traditional server.
			</p>
			<div class="hero-actions">
				<a class="button button-primary" href={resolve('/docs/[slug]', { slug: 'getting-started' })}
					>Start your instance <span aria-hidden="true">→</span></a
				>
				<a class="button button-secondary" href="https://s10t.io" target="_blank" rel="noreferrer"
					>s10t.io<span aria-hidden="true">↗</span></a
				>
			</div>
			<div class="hero-proof">
				<span><b>100%</b> serverless</span>
				<span><b>3</b> Cloudflare Workers</span>
				<span><b>5</b> complete UI languages</span>
			</div>
		</div>

		<div class="hero-visual" aria-label="SiliconBeest architecture overview">
			<div class="beest-halo"></div>
			<img class="beest" src="/brand/siliconbeest.png" alt="SiliconBeest wildebeest mark" />
			<div class="signal-card signal-fediverse">
				<span></span>
				<div><small>FEDERATION</small><strong>ActivityPub</strong></div>
				<b>LIVE</b>
			</div>
			<div class="signal-card signal-edge">
				<span></span>
				<div><small>RUNTIME</small><strong>Cloudflare Edge</strong></div>
				<b>275+</b>
			</div>
			<div class="orbit orbit-one"></div>
			<div class="orbit orbit-two"></div>
		</div>
	</div>
</section>

<section class="statement page-width section-space">
	<p class="section-kicker">WHY SILICONBEEST</p>
	<div class="statement-grid">
		<h2>Focus on your community,<br />not server maintenance.</h2>
		<p>
			Compute, data, media, real-time connections, and background work are distributed across
			Cloudflare managed services. The same architecture serves a personal instance or a growing
			community.
		</p>
	</div>
	<div class="feature-grid">
		<article>
			<span class="feature-index">01</span>
			<div class="feature-icon">⌁</div>
			<h3>Fediverse native</h3>
			<p>
				Fedify-powered ActivityPub, modern signatures, and Misskey extensions connect you to more of
				the fediverse.
			</p>
		</article>
		<article>
			<span class="feature-index">02</span>
			<div class="feature-icon">ϟ</div>
			<h3>Edge by default</h3>
			<p>
				Workers serve the API and web app, D1·R2·KV hold data, and Durable Objects power real-time
				connections.
			</p>
		</article>
		<article>
			<span class="feature-index">03</span>
			<div class="feature-icon">◇</div>
			<h3>Secure foundations</h3>
			<p>
				OAuth 2.0 + PKCE, passkeys, TOTP, scope enforcement, and safe remote-content handling are
				built in.
			</p>
		</article>
	</div>
</section>

<section class="architecture-band section-space">
	<div class="page-width architecture-grid">
		<div class="architecture-copy">
			<p class="section-kicker">ARCHITECTURE AT A GLANCE</p>
			<h2>Fast requests.<br />Asynchronous heavy lifting.</h2>
			<p>
				The main Worker serves the web app and API while queues isolate federation delivery,
				timelines, media, and notifications. Retries and a DLQ keep failures observable.
			</p>
			<a class="text-link" href={resolve('/docs/[slug]', { slug: 'architecture' })}
				>Explore the architecture <span>→</span></a
			>
		</div>
		<div class="system-map">
			<div class="map-users"><span>WEB</span><span>APPS</span><span>FEDIVERSE</span></div>
			<div class="map-line"></div>
			<div class="map-main">
				<small>MAIN WORKER</small><strong>siliconbeest</strong><em>Hono · Vue · Fedify</em>
			</div>
			<div class="map-branches"><span></span><span></span><span></span></div>
			<div class="map-services">
				<div><b>D1</b><small>SQL</small></div>
				<div><b>R2</b><small>MEDIA</small></div>
				<div><b>KV</b><small>CACHE</small></div>
				<div><b>DO</b><small>STREAM</small></div>
			</div>
			<div class="map-workers">
				<div><small>QUEUE</small><b>federation · fanout</b></div>
				<div><small>EMAIL</small><b>SMTP delivery</b></div>
			</div>
		</div>
	</div>
</section>

<section class="guides page-width section-space" id="guides">
	<div class="section-heading-row">
		<div>
			<p class="section-kicker">PROJECT GUIDES</p>
			<h2>A clear next step,<br />wherever you begin.</h2>
		</div>
		<label class="guide-search"
			><span aria-hidden="true">⌕</span><input
				bind:value={query}
				type="search"
				placeholder="Search guides"
				aria-label="Search guides"
			/></label
		>
	</div>

	<div class="guide-featured">
		{#each featuredDocs as doc, index (doc.slug)}
			<a class="guide-card featured" href={resolve('/docs/[slug]', { slug: doc.slug })}>
				<span class="guide-number">0{index + 1}</span>
				<div class="guide-icon">{doc.icon}</div>
				<small>{doc.category} · {doc.readTime}</small>
				<h3>{doc.title}</h3>
				<p>{doc.description}</p>
				<span class="card-arrow">→</span>
			</a>
		{/each}
	</div>

	<div class="guide-list" aria-live="polite">
		{#each filteredDocs.filter((doc) => !featuredDocs.includes(doc)) as doc (doc.slug)}
			<a href={resolve('/docs/[slug]', { slug: doc.slug })}>
				<span class="guide-icon small">{doc.icon}</span>
				<span><small>{doc.category}</small><strong>{doc.title}</strong></span>
				<p>{doc.description}</p>
				<em>{doc.readTime}</em><b aria-hidden="true">→</b>
			</a>
		{/each}
		{#if filteredDocs.length === 0}
			<p class="empty-search">No guides match “{query}”. Try another search.</p>
		{/if}
	</div>
</section>

<section class="cta-section page-width section-space">
	<div class="cta-panel">
		<div class="cta-beest"><img src="/brand/siliconbeest.png" alt="" /></div>
		<div>
			<p class="section-kicker light">READY TO FEDERATE?</p>
			<h2>Bring the open social web<br />to your own domain.</h2>
		</div>
		<div class="cta-actions">
			<a class="button button-light" href={resolve('/docs/[slug]', { slug: 'getting-started' })}
				>Deployment guide <span>→</span></a
			><a href="https://github.com/SJang1/siliconbeest" target="_blank" rel="noreferrer"
				>View on GitHub ↗</a
			>
		</div>
	</div>
</section>
