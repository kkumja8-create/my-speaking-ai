import { authenticate } from './accounts.js';

/** @typedef {import('./accounts.js').AuthUser} AuthUser */

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
	user = readStoredUser();
	ready = true;
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
	await new Promise((resolve) => setTimeout(resolve, 350));
	const next = authenticate(email, password);
	if (!next) {
		throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
	}
	user = next;
	persist(next);
	return next;
}

export function logout() {
	user = null;
	persist(null);
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
