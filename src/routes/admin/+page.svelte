<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth } from '$lib/auth/session.svelte.js';
	import { ADMIN_RECORDINGS, ADMIN_STATS, ADMIN_USERS } from '$lib/auth/admin-data.js';

	$effect(() => {
		if (!browser || !auth.ready) return;
		if (!auth.isLoggedIn) {
			goto(`${base}/login/`);
			return;
		}
		if (!auth.isAdmin) {
			goto(`${base}/`);
		}
	});

	/**
	 * @param {'ready' | 'processing' | 'failed'} status
	 */
	function statusLabel(status) {
		return {
			ready: '완료',
			processing: '처리 중',
			failed: '실패'
		}[status];
	}
</script>

<svelte:head>
	<title>관리자 모드 — Speaking AI</title>
</svelte:head>

{#if auth.ready && auth.isAdmin}
	<main class="admin">
		<header class="admin__header">
			<div>
				<p class="admin__eyebrow">Admin mode</p>
				<h1 class="admin__title">관리자 모드</h1>
				<p class="admin__lead">사용자와 최근 녹음 현황을 한눈에 확인합니다.</p>
			</div>
			<a class="admin__back" href={`${base}/`}>녹음 화면으로</a>
		</header>

		<section class="stats" aria-label="요약 지표">
			<article class="stat">
				<p class="stat__label">등록 사용자</p>
				<p class="stat__value">{ADMIN_STATS.users}</p>
			</article>
			<article class="stat">
				<p class="stat__label">오늘 녹음</p>
				<p class="stat__value">{ADMIN_STATS.recordingsToday}</p>
			</article>
			<article class="stat">
				<p class="stat__label">처리 중</p>
				<p class="stat__value">{ADMIN_STATS.processing}</p>
			</article>
			<article class="stat">
				<p class="stat__label">실패</p>
				<p class="stat__value">{ADMIN_STATS.failed}</p>
			</article>
		</section>

		<section class="panel" aria-labelledby="users-title">
			<h2 id="users-title" class="panel__title">사용자</h2>
			<div class="table-wrap">
				<table class="table">
					<thead>
						<tr>
							<th>이름</th>
							<th>이메일</th>
							<th>역할</th>
							<th>최근 활동</th>
							<th>녹음 수</th>
						</tr>
					</thead>
					<tbody>
						{#each ADMIN_USERS as row (row.id)}
							<tr>
								<td>{row.name}</td>
								<td>{row.email}</td>
								<td>
									<span class="badge" class:badge--admin={row.role === 'admin'}>
										{row.role === 'admin' ? '관리자' : '사용자'}
									</span>
								</td>
								<td>{row.lastActive}</td>
								<td>{row.recordings}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section class="panel" aria-labelledby="recordings-title">
			<h2 id="recordings-title" class="panel__title">최근 녹음</h2>
			<div class="table-wrap">
				<table class="table">
					<thead>
						<tr>
							<th>사용자</th>
							<th>제목</th>
							<th>길이</th>
							<th>시간</th>
							<th>상태</th>
						</tr>
					</thead>
					<tbody>
						{#each ADMIN_RECORDINGS as row (row.id)}
							<tr>
								<td>{row.userName}</td>
								<td>{row.title}</td>
								<td>{row.duration}</td>
								<td>{row.createdAt}</td>
								<td>
									<span
										class="badge"
										class:badge--ready={row.status === 'ready'}
										class:badge--processing={row.status === 'processing'}
										class:badge--failed={row.status === 'failed'}
									>
										{statusLabel(row.status)}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	</main>
{:else}
	<main class="admin admin--loading">
		<p>권한을 확인하는 중…</p>
	</main>
{/if}

<style>
	.admin {
		width: min(100%, 68rem);
		margin-inline: auto;
		padding: 1.25rem 1.25rem 3rem;
		display: grid;
		gap: 1.35rem;
	}

	.admin--loading {
		min-height: 40vh;
		place-items: center;
		color: var(--muted);
	}

	.admin__header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
	}

	.admin__eyebrow {
		margin: 0 0 0.25rem;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.admin__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.7rem, 4vw, 2.2rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--ink);
	}

	.admin__lead {
		margin: 0.35rem 0 0;
		color: var(--muted);
		font-size: 0.95rem;
	}

	.admin__back {
		text-decoration: none;
		color: var(--ink);
		font-size: 0.88rem;
		font-weight: 650;
		padding: 0.55rem 1rem;
		border-radius: 999px;
		background: color-mix(in oklab, white 55%, transparent);
		border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.stat {
		padding: 1rem 1.1rem;
		border-radius: 1.1rem;
		background: color-mix(in oklab, white 62%, var(--wash));
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
	}

	.stat__label {
		margin: 0;
		font-size: 0.8rem;
		color: var(--muted);
		font-weight: 600;
	}

	.stat__value {
		margin: 0.35rem 0 0;
		font-family: var(--font-display);
		font-size: 1.8rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--ink);
	}

	.panel {
		padding: 1.15rem 1.2rem 1.25rem;
		border-radius: 1.25rem;
		background: color-mix(in oklab, white 70%, var(--wash));
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		display: grid;
		gap: 0.85rem;
	}

	.panel__title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--ink);
	}

	.table-wrap {
		overflow-x: auto;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.table th,
	.table td {
		text-align: left;
		padding: 0.7rem 0.55rem;
		border-bottom: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		white-space: nowrap;
	}

	.table th {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--muted);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
		background: color-mix(in oklab, var(--ink) 8%, white);
		color: var(--ink-soft);
	}

	.badge--admin,
	.badge--ready {
		background: color-mix(in oklab, var(--accent) 18%, white);
		color: color-mix(in oklab, var(--accent) 70%, var(--ink));
	}

	.badge--processing {
		background: color-mix(in oklab, var(--warn) 18%, white);
		color: color-mix(in oklab, var(--warn) 75%, var(--ink));
	}

	.badge--failed {
		background: color-mix(in oklab, var(--record) 16%, white);
		color: color-mix(in oklab, var(--record) 75%, var(--ink));
	}

	@media (max-width: 800px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
