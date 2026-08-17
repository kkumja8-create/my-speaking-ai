/**
 * 관리자 대시보드용 데모 녹음 데이터
 */

/** @typedef {object} RecordingRow
 * @property {string} id
 * @property {string} userName
 * @property {string} title
 * @property {string} duration
 * @property {string} createdAt
 * @property {'ready' | 'processing' | 'failed'} status
 */

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

export const RECORDING_STATS = {
	recordingsToday: 9,
	processing: ADMIN_RECORDINGS.filter((item) => item.status === 'processing').length,
	failed: ADMIN_RECORDINGS.filter((item) => item.status === 'failed').length
};
