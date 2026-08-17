<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
	import { auth } from '$lib/auth/session.svelte.js';

	$effect(() => {
		if (!browser || !auth.ready) return;
		if (!auth.isLoggedIn) {
			goto(`${base}/login/`);
		}
	});
</script>

{#if auth.ready && auth.isLoggedIn}
	<main class="page">
		<VoiceRecorder />
	</main>
{:else}
	<main class="page page--loading">
		<p>로그인 상태를 확인하는 중…</p>
	</main>
{/if}

<style>
	.page {
		min-height: calc(100dvh - 4.5rem);
		display: grid;
		place-items: center;
		padding: clamp(1.5rem, 5vw, 3rem) 1.25rem;
	}

	.page--loading {
		color: var(--muted);
		font-size: 0.95rem;
	}
</style>
