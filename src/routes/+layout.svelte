<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Speaking AI — 목소리 녹음</title>
	<meta name="description" content="목소리를 녹음하고 상태를 확인하는 Speaking AI" />
</svelte:head>
{@render children()}
