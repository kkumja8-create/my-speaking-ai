<script>
	import { base } from '$app/paths';
	import LoginForm from '$lib/components/LoginForm.svelte';

	const userLoginHref = `${base}/login/`;
</script>

<svelte:head>
	<title>관리자 로그인 — Speaking AI</title>
</svelte:head>

<main class="page">
	<LoginForm
		mode="admin"
		title="관리자 로그인"
		lead="관리자 계정으로 로그인하면 관리자 모드에 접근할 수 있습니다."
		submitLabel="관리자 로그인"
		defaultEmail="admin@speaking.ai"
		hintTitle="관리자 데모 계정"
		hintLines={['admin@speaking.ai / admin123']}
		alternateHref={userLoginHref}
		alternateLabel="일반 로그인으로 이동"
	/>
</main>

<style>
	.page {
		min-height: calc(100dvh - 4.5rem);
		display: grid;
		place-items: center;
		padding: clamp(1.25rem, 4vw, 2.5rem) 1.25rem;
	}
</style>
