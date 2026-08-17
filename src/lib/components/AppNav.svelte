<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { auth, logout } from '$lib/auth/session.svelte.js';

	/**
	 * @param {string} path
	 */
	function href(path) {
		const clean = path.replace(/\/+$/, '') || '';
		const withBase = `${base}${clean.startsWith('/') ? clean : `/${clean}`}`;
		return withBase.endsWith('/') ? withBase : `${withBase}/`;
	}

	function handleLogout() {
		logout();
		goto(href('/login'));
	}
</script>

<header class="nav">
	<a class="nav__brand" href={href('/')}>Speaking AI</a>

	<nav class="nav__links" aria-label="주요 메뉴">
		{#if auth.isLoggedIn}
			<a class="nav__link" href={href('/')}>녹음</a>
		{/if}
		{#if auth.isAdmin}
			<a class="nav__link nav__link--accent" href={href('/admin')}>관리자</a>
		{/if}
	</nav>

	<div class="nav__actions">
		{#if auth.user}
			<span class="nav__user">
				<span class="nav__user-name">{auth.user.name}</span>
				<span class="nav__user-role">{auth.user.role === 'admin' ? '관리자' : '사용자'}</span>
			</span>
			<button type="button" class="nav__btn nav__btn--ghost" onclick={handleLogout}>로그아웃</button>
		{:else}
			<a class="nav__btn nav__btn--ghost" href={href('/signup')}>회원가입</a>
			<a class="nav__btn nav__btn--solid" href={href('/login')}>로그인</a>
			<a class="nav__btn nav__btn--admin" href={href('/login/admin')}>관리자 로그인</a>
		{/if}
	</div>
</header>

<style>
	.nav {
		width: min(100%, 68rem);
		margin-inline: auto;
		padding: 1rem 1.25rem 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1.25rem;
	}

	.nav__brand {
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--ink);
		text-decoration: none;
	}

	.nav__links {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.nav__link {
		text-decoration: none;
		color: var(--ink-soft);
		font-size: 0.92rem;
		font-weight: 600;
		padding: 0.4rem 0.75rem;
		border-radius: 999px;
	}

	.nav__link:hover {
		background: color-mix(in oklab, white 55%, transparent);
	}

	.nav__link--accent {
		color: var(--accent);
	}

	.nav__actions {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-left: auto;
	}

	.nav__muted {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.nav__user {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		line-height: 1.2;
	}

	.nav__user-name {
		font-size: 0.88rem;
		font-weight: 650;
		color: var(--ink);
	}

	.nav__user-role {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.nav__btn {
		appearance: none;
		border: none;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.55rem 1rem;
		border-radius: 999px;
		font-family: var(--font-body);
		font-size: 0.88rem;
		font-weight: 650;
	}

	.nav__btn--solid {
		background: var(--accent);
		color: white;
	}

	.nav__btn--admin {
		background: var(--ink);
		color: white;
	}

	.nav__btn--ghost {
		background: color-mix(in oklab, white 55%, transparent);
		color: var(--ink);
		border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent);
	}
</style>
