<script>
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppNav from '$lib/components/AppNav.svelte';
	import { initAuth } from '$lib/auth/session.svelte.js';

	let { children } = $props();

	onMount(() => {
		initAuth();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Speaking AI — 목소리 녹음</title>
	<meta name="description" content="목소리를 녹음하고 상태를 확인하는 Speaking AI" />
</svelte:head>

<AppNav />
{@render children()}
