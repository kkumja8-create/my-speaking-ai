/**
 * 관리자 대시보드용 데모 데이터
 */

/** @typedef {object} AdminUserRow
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'admin' | 'user'} role
 * @property {string} lastActive
 * @property {number} recordings
 */

/** @typedef {object} RecordingRow
 * @property {string} id
 * @property {string} userName
 * @property {string} title
 * @property {string} duration
 * @property {string} createdAt
 * @property {'ready' | 'processing' | 'failed'} status
 */

/** @type {AdminUserRow[]} */
export const ADMIN_USERS = [
	{
		id: 'u-admin',
		name: '관리자',
		email: 'admin@speaking.ai',
		role: 'admin',
		lastActive: '방금 전',
		recordings: 12
	},
	{
		id: 'u-user',
		name: '일반 사용자',
		email: 'user@speaking.ai',
		role: 'user',
		lastActive: '12분 전',
		recordings: 5
	},
	{
		id: 'u-3',
		name: '김민지',
		email: 'minji@example.com',
		role: 'user',
		lastActive: '1시간 전',
		recordings: 18
	},
	{
		id: 'u-4',
		name: '박준호',
		email: 'junho@example.com',
		role: 'user',
		lastActive: '어제',
		recordings: 3
	}
];

/** @type {RecordingRow[]} */
export const ADMIN_RECORDINGS = [
	{
		id: 'r-1',
		userName: '김민지',
		title: '발표 연습 #4',
		duration: '02:14',
		createdAt: '오늘 14:02',
		status: 'ready'
	},
	{
		id: 'r-2',
		userName: '일반 사용자',
		title: '영어 회화 연습',
		duration: '01:05',
		createdAt: '오늘 13:40',
		status: 'processing'
	},
	{
		id: 'r-3',
		userName: '박준호',
		title: '면접 답변 녹음',
		duration: '03:28',
		createdAt: '오늘 11:18',
		status: 'ready'
	},
	{
		id: 'r-4',
		userName: '김민지',
		title: '발음 체크',
		duration: '00:42',
		createdAt: '어제 19:55',
		status: 'failed'
	}
];

export const ADMIN_STATS = {
	users: ADMIN_USERS.length,
	recordingsToday: 9,
	processing: ADMIN_RECORDINGS.filter((item) => item.status === 'processing').length,
	failed: ADMIN_RECORDINGS.filter((item) => item.status === 'failed').length
};
