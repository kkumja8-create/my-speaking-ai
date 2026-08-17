<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { auth, login } from '$lib/auth/session.svelte.js';

	let email = $state('admin@speaking.ai');
	let password = $state('');
	let errorMessage = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (!auth.ready) return;
		if (auth.user) {
			const target = auth.isAdmin ? `${base}/admin/` : `${base}/`;
			goto(target);
		}
	});

	/**
	 * @param {SubmitEvent} event
	 */
	async function handleSubmit(event) {
		event.preventDefault();
		errorMessage = '';
		submitting = true;
		try {
			const user = await login(email, password);
			const target = user.role === 'admin' ? `${base}/admin/` : `${base}/`;
			await goto(target);
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>로그인 — Speaking AI</title>
</svelte:head>

<main class="page">
	<section class="login" aria-labelledby="login-title">
		<p class="login__brand">Speaking AI</p>
		<h1 id="login-title" class="login__title">로그인</h1>
		<p class="login__lead">계정으로 로그인하면 녹음 서비스와 관리자 모드를 이용할 수 있습니다.</p>

		<form class="login__form" onsubmit={handleSubmit}>
			<label class="field">
				<span class="field__label">이메일</span>
				<input
					class="field__input"
					type="email"
					name="email"
					autocomplete="username"
					bind:value={email}
					required
				/>
			</label>

			<label class="field">
				<span class="field__label">비밀번호</span>
				<input
					class="field__input"
					type="password"
					name="password"
					autocomplete="current-password"
					bind:value={password}
					required
				/>
			</label>

			{#if errorMessage}
				<p class="login__error" role="alert">{errorMessage}</p>
			{/if}

			<button class="login__submit" type="submit" disabled={submitting}>
				{submitting ? '로그인 중…' : '로그인'}
			</button>
		</form>

		<div class="login__hint">
			<p class="login__hint-title">데모 계정</p>
			<ul>
				<li><strong>관리자</strong> — admin@speaking.ai / admin123</li>
				<li><strong>사용자</strong> — user@speaking.ai / user123</li>
			</ul>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: calc(100dvh - 4.5rem);
		display: grid;
		place-items: center;
		padding: clamp(1.25rem, 4vw, 2.5rem) 1.25rem;
	}

	.login {
		width: min(100%, 26rem);
		display: grid;
		gap: 0.85rem;
		padding: clamp(1.5rem, 4vw, 2rem);
		border-radius: 1.5rem;
		background:
			radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 55%),
			linear-gradient(165deg, color-mix(in oklab, white 72%, var(--wash)), color-mix(in oklab, white 55%, var(--wash-deep)));
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		box-shadow:
			0 1px 0 color-mix(in oklab, white 70%, transparent) inset,
			0 24px 48px -28px color-mix(in oklab, var(--ink) 35%, transparent);
	}

	.login__brand {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.55rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--ink);
	}

	.login__title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 650;
		color: var(--ink-soft);
	}

	.login__lead {
		margin: 0;
		color: var(--muted);
		font-size: 0.92rem;
		line-height: 1.5;
	}

	.login__form {
		display: grid;
		gap: 0.85rem;
		margin-top: 0.35rem;
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}

	.field__label {
		font-size: 0.82rem;
		font-weight: 650;
		color: var(--ink-soft);
	}

	.field__input {
		width: 100%;
		padding: 0.75rem 0.9rem;
		border-radius: 0.85rem;
		border: 1px solid color-mix(in oklab, var(--ink) 14%, transparent);
		background: color-mix(in oklab, white 80%, transparent);
		font: inherit;
		color: var(--ink);
	}

	.field__input:focus {
		outline: 2px solid color-mix(in oklab, var(--accent) 45%, transparent);
		outline-offset: 1px;
	}

	.login__error {
		margin: 0;
		font-size: 0.88rem;
		color: color-mix(in oklab, var(--record) 80%, var(--ink));
	}

	.login__submit {
		appearance: none;
		border: none;
		cursor: pointer;
		margin-top: 0.15rem;
		padding: 0.85rem 1.1rem;
		border-radius: 999px;
		background: var(--ink);
		color: white;
		font: inherit;
		font-weight: 650;
		box-shadow: 0 12px 24px -14px color-mix(in oklab, var(--ink) 70%, transparent);
	}

	.login__submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login__hint {
		margin-top: 0.35rem;
		padding-top: 0.85rem;
		border-top: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		color: var(--muted);
		font-size: 0.82rem;
		line-height: 1.5;
	}

	.login__hint-title {
		margin: 0 0 0.35rem;
		font-weight: 650;
		color: var(--ink-soft);
	}

	.login__hint ul {
		margin: 0;
		padding-left: 1.1rem;
	}
</style>
