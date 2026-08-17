<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth, refreshSessionUser } from '$lib/auth/session.svelte.js';
	import {
		deleteAccount,
		registerAccount,
		updateAccount,
		usersStore
	} from '$lib/auth/users.svelte.js';
	import { ADMIN_RECORDINGS, RECORDING_STATS } from '$lib/auth/admin-data.js';

	let formError = $state('');
	let formMessage = $state('');
	let createName = $state('');
	let createEmail = $state('');
	let createPassword = $state('');
	let createRole = $state(/** @type {'admin' | 'user'} */ ('user'));

	/** @type {string | null} */
	let editingId = $state(null);
	let editName = $state('');
	let editRole = $state(/** @type {'admin' | 'user'} */ ('user'));
	let editPassword = $state('');

	$effect(() => {
		if (!browser || !auth.ready) return;
		if (!auth.isLoggedIn) {
			goto(`${base}/login/admin/`);
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

	/**
	 * @param {string} iso
	 */
	function formatDate(iso) {
		try {
			return new Date(iso).toLocaleDateString('ko-KR');
		} catch {
			return iso;
		}
	}

	/**
	 * @param {SubmitEvent} event
	 */
	function handleCreate(event) {
		event.preventDefault();
		formError = '';
		formMessage = '';
		try {
			registerAccount({
				name: createName,
				email: createEmail,
				password: createPassword,
				role: createRole
			});
			formMessage = '사용자를 추가했습니다.';
			createName = '';
			createEmail = '';
			createPassword = '';
			createRole = 'user';
		} catch (err) {
			formError = err instanceof Error ? err.message : '사용자 추가에 실패했습니다.';
		}
	}

	/**
	 * @param {import('$lib/auth/users.svelte.js').StoredAccount} account
	 */
	function startEdit(account) {
		editingId = account.id;
		editName = account.name;
		editRole = account.role;
		editPassword = '';
		formError = '';
		formMessage = '';
	}

	function cancelEdit() {
		editingId = null;
		editName = '';
		editPassword = '';
		formError = '';
	}

	/**
	 * @param {SubmitEvent} event
	 */
	function handleUpdate(event) {
		event.preventDefault();
		if (!editingId) return;
		formError = '';
		formMessage = '';
		try {
			/** @type {{ name: string, role: 'admin' | 'user', password?: string }} */
			const patch = { name: editName, role: editRole };
			if (editPassword.trim()) patch.password = editPassword.trim();
			const updated = updateAccount(editingId, patch);
			if (auth.user?.id === updated.id) {
				refreshSessionUser({
					id: updated.id,
					email: updated.email,
					name: updated.name,
					role: updated.role
				});
			}
			formMessage = '사용자 정보를 수정했습니다.';
			cancelEdit();
		} catch (err) {
			formError = err instanceof Error ? err.message : '수정에 실패했습니다.';
		}
	}

	/**
	 * @param {import('$lib/auth/users.svelte.js').StoredAccount} account
	 */
	function handleDelete(account) {
		formError = '';
		formMessage = '';
		const ok = confirm(`${account.name} (${account.email}) 계정을 삭제할까요?`);
		if (!ok) return;
		try {
			deleteAccount(account.id, auth.user?.id);
			if (editingId === account.id) cancelEdit();
			formMessage = '사용자를 삭제했습니다.';
		} catch (err) {
			formError = err instanceof Error ? err.message : '삭제에 실패했습니다.';
		}
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
				<p class="admin__lead">사용자를 추가·수정·삭제하고 최근 녹음 현황을 확인합니다.</p>
			</div>
			<a class="admin__back" href={`${base}/`}>녹음 화면으로</a>
		</header>

		<section class="stats" aria-label="요약 지표">
			<article class="stat">
				<p class="stat__label">등록 사용자</p>
				<p class="stat__value">{usersStore.stats.users}</p>
			</article>
			<article class="stat">
				<p class="stat__label">관리자</p>
				<p class="stat__value">{usersStore.stats.admins}</p>
			</article>
			<article class="stat">
				<p class="stat__label">오늘 녹음</p>
				<p class="stat__value">{RECORDING_STATS.recordingsToday}</p>
			</article>
			<article class="stat">
				<p class="stat__label">처리 중</p>
				<p class="stat__value">{RECORDING_STATS.processing}</p>
			</article>
		</section>

		{#if formError}
			<p class="flash flash--error" role="alert">{formError}</p>
		{/if}
		{#if formMessage}
			<p class="flash flash--ok" role="status">{formMessage}</p>
		{/if}

		<section class="panel" aria-labelledby="create-title">
			<h2 id="create-title" class="panel__title">사용자 추가</h2>
			<form class="create" onsubmit={handleCreate}>
				<label class="field">
					<span class="field__label">이름</span>
					<input class="field__input" bind:value={createName} required />
				</label>
				<label class="field">
					<span class="field__label">이메일</span>
					<input class="field__input" type="email" bind:value={createEmail} required />
				</label>
				<label class="field">
					<span class="field__label">비밀번호</span>
					<input class="field__input" type="password" bind:value={createPassword} minlength="6" required />
				</label>
				<label class="field">
					<span class="field__label">역할</span>
					<select class="field__input" bind:value={createRole}>
						<option value="user">사용자</option>
						<option value="admin">관리자</option>
					</select>
				</label>
				<button class="btn btn--primary" type="submit">추가</button>
			</form>
		</section>

		<section class="panel" aria-labelledby="users-title">
			<h2 id="users-title" class="panel__title">사용자 관리</h2>
			<div class="table-wrap">
				<table class="table">
					<thead>
						<tr>
							<th>이름</th>
							<th>이메일</th>
							<th>역할</th>
							<th>가입일</th>
							<th>최근 활동</th>
							<th>관리</th>
						</tr>
					</thead>
					<tbody>
						{#each usersStore.accounts as row (row.id)}
							<tr>
								<td>{row.name}</td>
								<td>{row.email}</td>
								<td>
									<span class="badge" class:badge--admin={row.role === 'admin'}>
										{row.role === 'admin' ? '관리자' : '사용자'}
									</span>
								</td>
								<td>{formatDate(row.createdAt)}</td>
								<td>{row.lastActive}</td>
								<td class="actions">
									<button type="button" class="btn btn--ghost" onclick={() => startEdit(row)}>수정</button>
									<button type="button" class="btn btn--danger" onclick={() => handleDelete(row)}>삭제</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if editingId}
				<form class="edit" onsubmit={handleUpdate}>
					<h3 class="edit__title">사용자 수정</h3>
					<label class="field">
						<span class="field__label">이름</span>
						<input class="field__input" bind:value={editName} required />
					</label>
					<label class="field">
						<span class="field__label">역할</span>
						<select class="field__input" bind:value={editRole}>
							<option value="user">사용자</option>
							<option value="admin">관리자</option>
						</select>
					</label>
					<label class="field">
						<span class="field__label">새 비밀번호 (선택)</span>
						<input class="field__input" type="password" bind:value={editPassword} minlength="6" />
					</label>
					<div class="edit__actions">
						<button class="btn btn--primary" type="submit">저장</button>
						<button class="btn btn--ghost" type="button" onclick={cancelEdit}>취소</button>
					</div>
				</form>
			{/if}
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

	.flash {
		margin: 0;
		padding: 0.75rem 1rem;
		border-radius: 0.9rem;
		font-size: 0.9rem;
	}

	.flash--error {
		background: color-mix(in oklab, var(--record) 12%, white);
		color: color-mix(in oklab, var(--record) 75%, var(--ink));
	}

	.flash--ok {
		background: color-mix(in oklab, var(--accent) 12%, white);
		color: color-mix(in oklab, var(--accent) 70%, var(--ink));
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

	.create,
	.edit {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
		gap: 0.75rem;
		align-items: end;
	}

	.edit {
		margin-top: 0.35rem;
		padding-top: 1rem;
		border-top: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.edit__title {
		grid-column: 1 / -1;
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--ink-soft);
	}

	.edit__actions {
		grid-column: 1 / -1;
		display: flex;
		gap: 0.55rem;
	}

	.field {
		display: grid;
		gap: 0.3rem;
	}

	.field__label {
		font-size: 0.78rem;
		font-weight: 650;
		color: var(--muted);
	}

	.field__input {
		width: 100%;
		padding: 0.65rem 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid color-mix(in oklab, var(--ink) 14%, transparent);
		background: color-mix(in oklab, white 85%, transparent);
		font: inherit;
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

	.actions {
		display: flex;
		gap: 0.4rem;
	}

	.btn {
		appearance: none;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.55rem 0.9rem;
		border-radius: 999px;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.btn--primary {
		background: var(--ink);
		color: white;
	}

	.btn--ghost {
		background: color-mix(in oklab, white 55%, transparent);
		color: var(--ink);
		border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent);
	}

	.btn--danger {
		background: color-mix(in oklab, var(--record) 12%, white);
		color: color-mix(in oklab, var(--record) 75%, var(--ink));
		border: 1px solid color-mix(in oklab, var(--record) 25%, transparent);
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

	@media (max-width: 900px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.create,
		.edit {
			grid-template-columns: 1fr;
		}
	}
</style>
