<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let menuOpen = $state(false);
	let isDark = $state(false);

	onMount(() => {
		isDark = document.documentElement.classList.contains('dark');
	});

	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.classList.toggle('dark', isDark);
		document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
		localStorage.setItem('siliconbeest_theme', isDark ? 'dark' : 'light');
		document.cookie = `siliconbeest_theme=${isDark ? 'dark' : 'light'};path=/;max-age=31536000;SameSite=Lax`;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<header class="site-header">
	<div class="header-inner">
		<a class="brand" href={resolve('/')} aria-label="SiliconBeest Hub home" onclick={closeMenu}>
			<span class="brand-mark"><img src="/brand/icon-512.png" alt="" /></span>
			<span>
				<strong>SiliconBeest</strong>
				<small>PROJECT HUB</small>
			</span>
		</a>

		<nav class:open={menuOpen} aria-label="Main navigation">
			<a class:active={page.url.pathname === '/'} href={resolve('/')} onclick={closeMenu}
				>Overview</a
			>
			<a
				class:active={page.url.pathname === '/instances'}
				href={resolve('/instances')}
				onclick={closeMenu}>Instances</a
			>
			<a
				class:active={page.url.pathname.startsWith('/docs')}
				href={resolve('/docs/[slug]', { slug: 'getting-started' })}
				onclick={closeMenu}>Docs</a
			>
			<a
				class:active={page.url.pathname === '/contact'}
				href={resolve('/contact')}
				onclick={closeMenu}>Contact</a
			>
			<a href="https://s10t.io" target="_blank" rel="noreferrer"
				>Main Instance <span aria-hidden="true">↗</span></a
			>
			<a href="https://github.com/SJang1/siliconbeest" target="_blank" rel="noreferrer"
				>GitHub <span aria-hidden="true">↗</span></a
			>
		</nav>

		<div class="header-actions">
			<button
				class="theme-button"
				type="button"
				onclick={toggleTheme}
				aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				title={isDark ? 'Light mode' : 'Dark mode'}
			>
				<span aria-hidden="true">{isDark ? '☀' : '◐'}</span>
			</button>
			<button
				class="menu-button"
				class:open={menuOpen}
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
			>
				<span></span><span></span>
			</button>
		</div>
	</div>
</header>
