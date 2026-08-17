<script>
	import { base } from '$app/paths';
	import LoginForm from '$lib/components/LoginForm.svelte';

	const adminLoginHref = `${base}/login/admin/`;
</script>

<svelte:head>
	<title>로그인 — Speaking AI</title>
</svelte:head>

<main class="page">
	<LoginForm
		mode="user"
		title="로그인"
		lead="로그인한 뒤에 목소리 녹음을 이용할 수 있습니다."
		submitLabel="로그인"
		defaultEmail="user@speaking.ai"
		hintLines={['user@speaking.ai / user123']}
		alternateHref={adminLoginHref}
		alternateLabel="관리자 로그인으로 이동"
	/>
	<p class="page__signup">
		계정이 없나요?
		<a href={`${base}/signup/`}>회원가입</a>
	</p>
</main>

<style>
	.page {
		min-height: calc(100dvh - 4.5rem);
		display: grid;
		place-items: center;
		padding: clamp(1.25rem, 4vw, 2.5rem) 1.25rem;
		gap: 0.85rem;
	}

	.page__signup {
		margin: 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.page__signup a {
		color: var(--ink-soft);
		font-weight: 650;
	}
</style>
