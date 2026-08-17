<script>
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
	import { auth } from '$lib/auth/session.svelte.js';

	/**
	 * @param {string} path
	 */
	function href(path) {
		const clean = path.replace(/\/+$/, '') || '';
		const withBase = `${base}${clean.startsWith('/') ? clean : `/${clean}`}`;
		return withBase.endsWith('/') ? withBase : `${withBase}/`;
	}
</script>

{#if auth.ready && auth.isLoggedIn}
	<main class="page">
		<VoiceRecorder />
	</main>
{:else if !browser || !auth.ready}
	<main class="page page--gate">
		<section class="gate" aria-labelledby="gate-title">
			<p class="gate__brand">Speaking AI</p>
			<h1 id="gate-title" class="gate__title">로그인이 필요합니다</h1>
			<p class="gate__lead">목소리 녹음은 로그인 후 이용할 수 있습니다.</p>
			<div class="gate__actions">
				<a class="gate__btn gate__btn--primary" href={href('/login')}>로그인</a>
				<a class="gate__btn gate__btn--ghost" href={href('/signup')}>회원가입</a>
				<a class="gate__btn gate__btn--admin" href={href('/login/admin')}>관리자 로그인</a>
			</div>
		</section>
	</main>
{:else}
	<main class="page page--gate">
		<section class="gate" aria-labelledby="gate-title">
			<p class="gate__brand">Speaking AI</p>
			<h1 id="gate-title" class="gate__title">로그인이 필요합니다</h1>
			<p class="gate__lead">목소리 녹음은 로그인 후 이용할 수 있습니다.</p>
			<div class="gate__actions">
				<a class="gate__btn gate__btn--primary" href={href('/login')}>로그인</a>
				<a class="gate__btn gate__btn--ghost" href={href('/signup')}>회원가입</a>
				<a class="gate__btn gate__btn--admin" href={href('/login/admin')}>관리자 로그인</a>
			</div>
		</section>
	</main>
{/if}

<style>
	.page {
		min-height: calc(100dvh - 4.5rem);
		display: grid;
		place-items: center;
		padding: clamp(1.5rem, 5vw, 3rem) 1.25rem;
	}

	.gate {
		width: min(100%, 28rem);
		display: grid;
		gap: 0.75rem;
		padding: clamp(1.5rem, 4vw, 2.1rem);
		border-radius: 1.5rem;
		text-align: center;
		background:
			radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 55%),
			linear-gradient(165deg, color-mix(in oklab, white 72%, var(--wash)), color-mix(in oklab, white 55%, var(--wash-deep)));
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		box-shadow:
			0 1px 0 color-mix(in oklab, white 70%, transparent) inset,
			0 24px 48px -28px color-mix(in oklab, var(--ink) 35%, transparent);
	}

	.gate__brand {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.7rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--ink);
	}

	.gate__title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 650;
		color: var(--ink-soft);
	}

	.gate__lead {
		margin: 0;
		color: var(--muted);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.gate__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.55rem;
		margin-top: 0.55rem;
	}

	.gate__btn {
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 1.05rem;
		border-radius: 999px;
		font-size: 0.9rem;
		font-weight: 650;
	}

	.gate__btn--primary {
		background: var(--accent);
		color: white;
	}

	.gate__btn--ghost {
		background: color-mix(in oklab, white 55%, transparent);
		color: var(--ink);
		border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent);
	}

	.gate__btn--admin {
		background: var(--ink);
		color: white;
	}
</style>
