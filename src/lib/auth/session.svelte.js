import { authenticate, initUsers, registerAccount } from './users.svelte.js';

/** @typedef {import('./users.svelte.js').AuthUser} AuthUser */

const STORAGE_KEY = 'speaking-ai-session';

/** @type {AuthUser | null} */
let user = $state(null);
let ready = $state(false);

function readStoredUser() {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (
			parsed &&
			typeof parsed.id === 'string' &&
			typeof parsed.email === 'string' &&
			typeof parsed.name === 'string' &&
			(parsed.role === 'admin' || parsed.role === 'user')
		) {
			return /** @type {AuthUser} */ (parsed);
		}
	} catch {
		// ignore invalid storage
	}
	return null;
}

function persist(next) {
	if (typeof localStorage === 'undefined') return;
	if (next) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}
}

export function initAuth() {
	initUsers();
	user = readStoredUser();
	ready = true;
}

/**
 * @param {string} email
 * @param {string} password
 * @param {{ requireRole?: import('./users.svelte.js').Role }} [options]
 */
export async function login(email, password, options = {}) {
	await new Promise((resolve) => setTimeout(resolve, 350));
	const next = authenticate(email, password);
	if (!next) {
		throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
	}
	if (options.requireRole && next.role !== options.requireRole) {
		if (options.requireRole === 'admin') {
			throw new Error('관리자 계정이 아닙니다. 관리자 로그인으로 다시 시도해 주세요.');
		}
		throw new Error('일반 사용자 계정이 아닙니다. 관리자 로그인을 이용해 주세요.');
	}
	user = next;
	persist(next);
	return next;
}

/**
 * @param {{ name: string, email: string, password: string }} input
 */
export async function signup(input) {
	await new Promise((resolve) => setTimeout(resolve, 350));
	const next = registerAccount({ ...input, role: 'user' });
	user = next;
	persist(next);
	return next;
}

export function logout() {
	user = null;
	persist(null);
}

/**
 * @param {AuthUser} next
 */
export function refreshSessionUser(next) {
	if (!user || user.id !== next.id) return;
	user = next;
	persist(next);
}

export const auth = {
	get user() {
		return user;
	},
	get ready() {
		return ready;
	},
	get isLoggedIn() {
		return user !== null;
	},
	get isAdmin() {
		return user?.role === 'admin';
	}
};
