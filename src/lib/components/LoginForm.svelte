<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { auth, login } from '$lib/auth/session.svelte.js';

	/**
	 * @typedef {'user' | 'admin'} LoginMode
	 */

	/** @type {{ mode?: LoginMode, title: string, lead: string, submitLabel?: string, defaultEmail?: string, hintTitle?: string, hintLines?: string[], alternateHref?: string, alternateLabel?: string }} */
	let {
		mode = 'user',
		title,
		lead,
		submitLabel = '로그인',
		defaultEmail = '',
		hintTitle = '데모 계정',
		hintLines = [],
		alternateHref = '',
		alternateLabel = ''
	} = $props();

	let email = $state(defaultEmail);
	let password = $state('');
	let errorMessage = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (!auth.ready) return;
		if (!auth.user) return;
		goto(auth.isAdmin ? `${base}/admin/` : `${base}/`);
	});

	/**
	 * @param {SubmitEvent} event
	 */
	async function handleSubmit(event) {
		event.preventDefault();
		errorMessage = '';
		submitting = true;
		try {
			const user = await login(email, password, { requireRole: mode });
			const target = user.role === 'admin' ? `${base}/admin/` : `${base}/`;
			await goto(target);
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="login" class:login--admin={mode === 'admin'} aria-labelledby="login-title">
	<p class="login__brand">Speaking AI</p>
	{#if mode === 'admin'}
		<p class="login__badge">Admin</p>
	{/if}
	<h1 id="login-title" class="login__title">{title}</h1>
	<p class="login__lead">{lead}</p>

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

		<button
			class="login__submit"
			class:login__submit--admin={mode === 'admin'}
			type="submit"
			disabled={submitting}
		>
			{submitting ? '로그인 중…' : submitLabel}
		</button>
	</form>

	{#if hintLines.length}
		<div class="login__hint">
			<p class="login__hint-title">{hintTitle}</p>
			<ul>
				{#each hintLines as line (line)}
					<li>{line}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if alternateHref && alternateLabel}
		<p class="login__alt">
			<a href={alternateHref}>{alternateLabel}</a>
		</p>
	{/if}
</section>

<style>
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

	.login--admin {
		background:
			radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--ink) 14%, transparent), transparent 55%),
			linear-gradient(165deg, color-mix(in oklab, white 70%, var(--wash-deep)), color-mix(in oklab, white 52%, #c5d7ce));
		border-color: color-mix(in oklab, var(--ink) 14%, transparent);
	}

	.login__brand {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.55rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--ink);
	}

	.login__badge {
		margin: -0.35rem 0 0;
		width: fit-content;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: white;
		background: var(--ink);
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
		background: var(--accent);
		color: white;
		font: inherit;
		font-weight: 650;
		box-shadow: 0 12px 24px -14px color-mix(in oklab, var(--accent) 70%, transparent);
	}

	.login__submit--admin {
		background: var(--ink);
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

	.login__alt {
		margin: 0;
		text-align: center;
		font-size: 0.85rem;
	}

	.login__alt a {
		color: var(--ink-soft);
		font-weight: 650;
	}
</style>
