<script lang="ts">
	import { docs } from '$lib/docs';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let { doc } = $derived(data);
</script>

<svelte:head>
	<title>{doc.title} — SiliconBeest</title>
	<meta name="description" content={doc.description} />
</svelte:head>

<div class="docs-shell page-width">
	<aside class="docs-sidebar" aria-label="Documentation pages">
		<div class="sidebar-label">DOCUMENTATION</div>
		{#each docs as item (item.slug)}
			<a class:active={item.slug === doc.slug} href={resolve('/docs/[slug]', { slug: item.slug })}>
				<span>{item.icon}</span>
				<div><small>{item.category}</small>{item.title}</div>
			</a>
		{/each}
	</aside>

	<article class="docs-content">
		<header class="doc-hero">
			<div class="doc-breadcrumb">
				<a href={resolve('/')}>Home</a><span>/</span><span>{doc.category}</span>
			</div>
			<div class="doc-icon">{doc.icon}</div>
			<p class="section-kicker">{doc.category}</p>
			<h1>{doc.title}</h1>
			<p>{doc.description}</p>
			<div class="doc-meta">
				<span>{doc.readTime}</span><span>Based on project sources</span><span>English</span>
			</div>
		</header>

		{#each doc.sections as section (section.id)}
			<section class="doc-section" id={section.id}>
				<h2>{section.title}</h2>
				{#if section.lead}<p class="section-lead">{section.lead}</p>{/if}
				{#each section.blocks as block, blockIndex (blockIndex)}
					{#if block.type === 'paragraph'}
						<p>{block.text}</p>
					{:else if block.type === 'list'}
						<ul>
							{#each block.items as item (item)}<li>{item}</li>{/each}
						</ul>
					{:else if block.type === 'steps'}
						<ol class="steps">
							{#each block.items as item, index (item.title)}<li>
									<span>{index + 1}</span>
									<div>
										<strong>{item.title}</strong>
										<p>{item.text}</p>
									</div>
								</li>{/each}
						</ol>
					{:else if block.type === 'code'}
						<div class="code-block">
							<div><span></span><span></span><span></span><small>{block.label}</small></div>
							<pre><code>{block.code}</code></pre>
						</div>
					{:else if block.type === 'callout'}
						<div
							class:warning={block.tone === 'warning'}
							class:success={block.tone === 'success'}
							class="callout"
						>
							<span>{block.tone === 'warning' ? '!' : block.tone === 'success' ? '✓' : 'i'}</span>
							<div>
								<strong>{block.title}</strong>
								<p>{block.text}</p>
							</div>
						</div>
					{:else if block.type === 'table'}
						<div class="table-wrap">
							<table>
								<thead
									><tr
										>{#each block.headers as header (header)}<th>{header}</th>{/each}</tr
									></thead
								><tbody
									>{#each block.rows as row, rowIndex (rowIndex)}<tr
											>{#each row as cell, cellIndex (cellIndex)}<td>{cell}</td>{/each}</tr
										>{/each}</tbody
								>
							</table>
						</div>
					{/if}
				{/each}
			</section>
		{/each}

		<div class="doc-end">
			<div>
				<span>Want to improve this documentation?</span><strong>Every contribution helps.</strong>
			</div>
			<a
				class="button button-secondary"
				href="https://github.com/SJang1/siliconbeest"
				target="_blank"
				rel="noreferrer">Contribute on GitHub ↗</a
			>
		</div>
	</article>

	<aside class="doc-toc" aria-label="On this page">
		<strong>On this page</strong>
		{#each doc.sections as section (section.id)}<a href={`#${section.id}`}>{section.title}</a
			>{/each}
		<div class="toc-divider"></div>
		<a href={resolve('/docs/[slug]', { slug: 'development' })}>Contribution guide →</a>
	</aside>
</div>
