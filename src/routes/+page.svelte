<script>
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
</script>

<main class="page">
	<VoiceRecorder />
</main>

<style>
	.page {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: clamp(1.5rem, 5vw, 3rem) 1.25rem;
	}
</style>
