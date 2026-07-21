<script lang="ts">
	import './layout.css';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/brand/icon-512.png" />
	<meta name="theme-color" content="#6366f1" />
	<meta
		name="description"
		content="SiliconBeest project, development, and operations documentation"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="SiliconBeest" />
	<meta property="og:title" content="SiliconBeest" />
	<meta
		property="og:description"
		content="A compact, resilient Fediverse platform built for the Cloudflare edge."
	/>
	<meta property="og:image" content={`${data.origin}/og.png`} />
	<meta property="og:image:width" content="1729" />
	<meta property="og:image:height" content="910" />
	<meta property="og:image:alt" content="SiliconBeest wildebeest mark and project tagline" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="SiliconBeest" />
	<meta name="twitter:description" content="Your fediverse, light and resilient." />
	<meta name="twitter:image" content={`${data.origin}/og.png`} />
</svelte:head>

<div class="site-shell">
	<SiteHeader />
	<main>{@render children()}</main>
	<SiteFooter />
</div>
