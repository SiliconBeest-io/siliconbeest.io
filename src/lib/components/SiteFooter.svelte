<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="site-footer">
	<div class="footer-grid">
		<div>
			<a class="footer-brand" href={resolve('/')}
				><img src="/brand/icon-512.png" alt="" /> SiliconBeest</a
			>
			<p>A compact, resilient Fediverse platform built for the Cloudflare edge.</p>
		</div>
		<div>
			<strong>Documentation</strong>
			<a href={resolve('/docs/[slug]', { slug: 'getting-started' })}>Getting started</a>
			<a href={resolve('/docs/[slug]', { slug: 'development' })}>Development guide</a>
			<a href={resolve('/docs/[slug]', { slug: 'operations' })}>Operations guide</a>
		</div>
		<div>
			<strong>Project</strong>
			<a href={resolve('/instances')}>Instance directory</a>
			<a href={resolve('/docs/[slug]', { slug: 'architecture' })}>Architecture</a>
			<a href={resolve('/docs/[slug]', { slug: 'federation' })}>Federation</a>
			<a href={resolve('/docs/[slug]', { slug: 'security' })}>Security</a>
			<a href={resolve('/contact')}>Contact the project</a>
		</div>
		<div>
			<strong>Links</strong>
			<a href="https://s10t.io" target="_blank" rel="noreferrer">Main Instance ↗</a>
			<a href="https://github.com/SJang1/siliconbeest" target="_blank" rel="noreferrer">GitHub ↗</a>
			<a href="https://fedify.dev" target="_blank" rel="noreferrer">Fedify ↗</a>
		</div>
	</div>
	<div class="footer-bottom">
		<span>© {new Date().getFullYear()} SiliconBeest contributors</span>
		<span>AGPL-3.0 · Built for the open social web</span>
	</div>
</footer>
