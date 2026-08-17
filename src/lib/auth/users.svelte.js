/** @typedef {'admin' | 'user'} Role */

/**
 * @typedef {object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {Role} role
 */

/**
 * @typedef {object} StoredAccount
 * @property {string} id
 * @property {string} email
 * @property {string} password
 * @property {string} name
 * @property {Role} role
 * @property {string} createdAt
 * @property {string} lastActive
 * @property {number} recordings
 */

const USERS_KEY = 'speaking-ai-users';

/** @type {StoredAccount[]} */
export const SEED_ACCOUNTS = [
	{
		id: 'u-admin',
		email: 'admin@speaking.ai',
		password: 'admin123',
		name: '관리자',
		role: 'admin',
		createdAt: '2026-08-01T00:00:00.000Z',
		lastActive: '방금 전',
		recordings: 12
	},
	{
		id: 'u-user',
		email: 'user@speaking.ai',
		password: 'user123',
		name: '일반 사용자',
		role: 'user',
		createdAt: '2026-08-02T00:00:00.000Z',
		lastActive: '12분 전',
		recordings: 5
	}
];

/** @type {StoredAccount[]} */
let accounts = $state(structuredClone(SEED_ACCOUNTS));
let usersReady = $state(false);

function canUseStorage() {
	return typeof localStorage !== 'undefined';
}

/**
 * @param {unknown} value
 * @returns {value is StoredAccount}
 */
function isAccount(value) {
	if (!value || typeof value !== 'object') return false;
	const item = /** @type {Record<string, unknown>} */ (value);
	return (
		typeof item.id === 'string' &&
		typeof item.email === 'string' &&
		typeof item.password === 'string' &&
		typeof item.name === 'string' &&
		(item.role === 'admin' || item.role === 'user') &&
		typeof item.createdAt === 'string' &&
		typeof item.lastActive === 'string' &&
		typeof item.recordings === 'number'
	);
}

function persistAccounts() {
	if (!canUseStorage()) return;
	localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

/**
 * @param {string} email
 */
function normalizeEmail(email) {
	return email.trim().toLowerCase();
}

export function initUsers() {
	if (!canUseStorage()) {
		accounts = structuredClone(SEED_ACCOUNTS);
		usersReady = true;
		return;
	}

	try {
		const raw = localStorage.getItem(USERS_KEY);
		if (!raw) {
			accounts = structuredClone(SEED_ACCOUNTS);
			persistAccounts();
		} else {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.every(isAccount) && parsed.length > 0) {
				accounts = parsed;
			} else {
				accounts = structuredClone(SEED_ACCOUNTS);
				persistAccounts();
			}
		}
	} catch {
		accounts = structuredClone(SEED_ACCOUNTS);
		persistAccounts();
	}

	usersReady = true;
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {AuthUser | null}
 */
export function authenticate(email, password) {
	const normalized = normalizeEmail(email);
	const account = accounts.find(
		(item) => item.email === normalized && item.password === password
	);
	if (!account) return null;

	account.lastActive = '방금 전';
	persistAccounts();

	return {
		id: account.id,
		email: account.email,
		name: account.name,
		role: account.role
	};
}

/**
 * @param {{ name: string, email: string, password: string, role?: Role }} input
 */
export function registerAccount(input) {
	const name = input.name.trim();
	const email = normalizeEmail(input.email);
	const password = input.password;
	const role = input.role ?? 'user';

	if (!name) throw new Error('이름을 입력해 주세요.');
	if (!email || !email.includes('@')) throw new Error('올바른 이메일을 입력해 주세요.');
	if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
	if (accounts.some((item) => item.email === email)) {
		throw new Error('이미 사용 중인 이메일입니다.');
	}

	/** @type {StoredAccount} */
	const account = {
		id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		email,
		password,
		name,
		role,
		createdAt: new Date().toISOString(),
		lastActive: '방금 전',
		recordings: 0
	};

	accounts = [...accounts, account];
	persistAccounts();

	return {
		id: account.id,
		email: account.email,
		name: account.name,
		role: account.role
	};
}

/**
 * @param {string} id
 * @param {{ name?: string, role?: Role, password?: string }} patch
 */
export function updateAccount(id, patch) {
	const index = accounts.findIndex((item) => item.id === id);
	if (index < 0) throw new Error('사용자를 찾을 수 없습니다.');

	const current = accounts[index];
	const nextName = patch.name?.trim() ?? current.name;
	const nextRole = patch.role ?? current.role;
	const nextPassword = patch.password ?? current.password;

	if (!nextName) throw new Error('이름을 입력해 주세요.');
	if (patch.password !== undefined && patch.password.length < 6) {
		throw new Error('비밀번호는 6자 이상이어야 합니다.');
	}

	const adminCount = accounts.filter((item) => item.role === 'admin').length;
	if (current.role === 'admin' && nextRole !== 'admin' && adminCount <= 1) {
		throw new Error('마지막 관리자 계정은 역할을 변경할 수 없습니다.');
	}

	accounts = accounts.map((item, i) =>
		i === index
			? {
					...item,
					name: nextName,
					role: nextRole,
					password: nextPassword
				}
			: item
	);
	persistAccounts();
	return accounts[index];
}

/**
 * @param {string} id
 * @param {string} [currentUserId]
 */
export function deleteAccount(id, currentUserId) {
	const target = accounts.find((item) => item.id === id);
	if (!target) throw new Error('사용자를 찾을 수 없습니다.');
	if (currentUserId && target.id === currentUserId) {
		throw new Error('현재 로그인한 계정은 삭제할 수 없습니다.');
	}

	const adminCount = accounts.filter((item) => item.role === 'admin').length;
	if (target.role === 'admin' && adminCount <= 1) {
		throw new Error('마지막 관리자 계정은 삭제할 수 없습니다.');
	}

	accounts = accounts.filter((item) => item.id !== id);
	persistAccounts();
}

export function listAccounts() {
	return accounts;
}

export const usersStore = {
	get ready() {
		return usersReady;
	},
	get accounts() {
		return accounts;
	},
	get stats() {
		return {
			users: accounts.length,
			admins: accounts.filter((item) => item.role === 'admin').length,
			members: accounts.filter((item) => item.role === 'user').length
		};
	}
};
