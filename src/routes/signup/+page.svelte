<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { auth, signup } from '$lib/auth/session.svelte.js';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let errorMessage = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (!auth.ready) return;
		if (auth.user) goto(`${base}/`);
	});

	/**
	 * @param {SubmitEvent} event
	 */
	async function handleSubmit(event) {
		event.preventDefault();
		errorMessage = '';

		if (password !== passwordConfirm) {
			errorMessage = '비밀번호 확인이 일치하지 않습니다.';
			return;
		}

		submitting = true;
		try {
			await signup({ name, email, password });
			await goto(`${base}/`);
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>회원가입 — Speaking AI</title>
</svelte:head>

<main class="page">
	<section class="signup" aria-labelledby="signup-title">
		<p class="signup__brand">Speaking AI</p>
		<h1 id="signup-title" class="signup__title">회원가입</h1>
		<p class="signup__lead">계정을 만들면 바로 목소리 녹음을 시작할 수 있습니다.</p>

		<form class="signup__form" onsubmit={handleSubmit}>
			<label class="field">
				<span class="field__label">이름</span>
				<input class="field__input" type="text" name="name" autocomplete="name" bind:value={name} required />
			</label>

			<label class="field">
				<span class="field__label">이메일</span>
				<input
					class="field__input"
					type="email"
					name="email"
					autocomplete="email"
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
					autocomplete="new-password"
					bind:value={password}
					minlength="6"
					required
				/>
			</label>

			<label class="field">
				<span class="field__label">비밀번호 확인</span>
				<input
					class="field__input"
					type="password"
					name="passwordConfirm"
					autocomplete="new-password"
					bind:value={passwordConfirm}
					minlength="6"
					required
				/>
			</label>

			{#if errorMessage}
				<p class="signup__error" role="alert">{errorMessage}</p>
			{/if}

			<button class="signup__submit" type="submit" disabled={submitting}>
				{submitting ? '가입 중…' : '회원가입'}
			</button>
		</form>

		<p class="signup__alt">
			이미 계정이 있나요?
			<a href={`${base}/login/`}>로그인</a>
		</p>
	</section>
</main>

<style>
	.page {
		min-height: calc(100dvh - 4.5rem);
		display: grid;
		place-items: center;
		padding: clamp(1.25rem, 4vw, 2.5rem) 1.25rem;
	}

	.signup {
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

	.signup__brand {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.55rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--ink);
	}

	.signup__title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 650;
		color: var(--ink-soft);
	}

	.signup__lead {
		margin: 0;
		color: var(--muted);
		font-size: 0.92rem;
		line-height: 1.5;
	}

	.signup__form {
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

	.signup__error {
		margin: 0;
		font-size: 0.88rem;
		color: color-mix(in oklab, var(--record) 80%, var(--ink));
	}

	.signup__submit {
		appearance: none;
		border: none;
		cursor: pointer;
		margin-top: 0.15rem;
		padding: 0.85rem 1.1rem;
		border-radius: 999px;
		background: var(--accent);
		color: white;
		font: inherit;
		font-weight: 650;
		box-shadow: 0 12px 24px -14px color-mix(in oklab, var(--accent) 70%, transparent);
	}

	.signup__submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.signup__alt {
		margin: 0.25rem 0 0;
		text-align: center;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.signup__alt a {
		color: var(--ink-soft);
		font-weight: 650;
	}
</style>
