/** @typedef {'admin' | 'user'} Role */

/**
 * @typedef {object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {Role} role
 */

/**
 * @typedef {object} DemoAccount
 * @property {string} id
 * @property {string} email
 * @property {string} password
 * @property {string} name
 * @property {Role} role
 */

/** @type {DemoAccount[]} */
export const DEMO_ACCOUNTS = [
	{
		id: 'u-admin',
		email: 'admin@speaking.ai',
		password: 'admin123',
		name: '관리자',
		role: 'admin'
	},
	{
		id: 'u-user',
		email: 'user@speaking.ai',
		password: 'user123',
		name: '일반 사용자',
		role: 'user'
	}
];

/**
 * @param {string} email
 * @param {string} password
 * @returns {AuthUser | null}
 */
export function authenticate(email, password) {
	const normalized = email.trim().toLowerCase();
	const account = DEMO_ACCOUNTS.find(
		(item) => item.email === normalized && item.password === password
	);
	if (!account) return null;

	return {
		id: account.id,
		email: account.email,
		name: account.name,
		role: account.role
	};
}
