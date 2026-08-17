<script>
	import { onDestroy } from 'svelte';

	/** @typedef {'idle' | 'requesting' | 'recording' | 'paused' | 'stopped' | 'error'} RecordStatus */

	/** @type {RecordStatus} */
	let status = $state('idle');
	let errorMessage = $state('');
	let durationMs = $state(0);
	let audioUrl = $state(/** @type {string | null} */ (null));
	let audioBlob = $state(/** @type {Blob | null} */ (null));
	/** @type {number[]} */
	let levels = $state(Array.from({ length: 32 }, () => 0.08));

	/** @type {MediaStream | null} */
	let stream = null;
	/** @type {MediaRecorder | null} */
	let mediaRecorder = null;
	/** @type {Blob[]} */
	let chunks = [];
	/** @type {number | null} */
	let timerId = null;
	/** @type {number | null} */
	let startedAt = null;
	/** @type {number} */
	let accumulatedMs = 0;
	/** @type {AudioContext | null} */
	let audioContext = null;
	/** @type {AnalyserNode | null} */
	let analyser = null;
	/** @type {number | null} */
	let rafId = null;
	/** @type {HTMLAudioElement | undefined} */
	let playbackEl = $state();
	let isPlaying = $state(false);

	const statusLabel = $derived(
		{
			idle: '대기 중',
			requesting: '마이크 권한 요청 중…',
			recording: '녹음 중',
			paused: '일시정지',
			stopped: '녹음 완료',
			error: '오류'
		}[status]
	);

	const showStart = $derived(status === 'idle' || status === 'error');

	function formatDuration(ms) {
		const totalSec = Math.floor(ms / 1000);
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	function pickMimeType() {
		const candidates = [
			'audio/webm;codecs=opus',
			'audio/webm',
			'audio/mp4',
			'audio/ogg;codecs=opus'
		];
		for (const type of candidates) {
			if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
				return type;
			}
		}
		return '';
	}

	function clearTimer() {
		if (timerId !== null) {
			clearInterval(timerId);
			timerId = null;
		}
	}

	function startTimer() {
		clearTimer();
		startedAt = Date.now();
		timerId = setInterval(() => {
			if (startedAt !== null) {
				durationMs = accumulatedMs + (Date.now() - startedAt);
			}
		}, 200);
	}

	function stopMeter() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		levels = Array.from({ length: 32 }, () => 0.08);
	}

	function tickMeter() {
		if (!analyser) return;
		const data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(data);

		const next = [];
		const step = Math.floor(data.length / 32) || 1;
		for (let i = 0; i < 32; i++) {
			let sum = 0;
			for (let j = 0; j < step; j++) sum += data[i * step + j] ?? 0;
			const avg = sum / step / 255;
			next.push(0.08 + avg * 0.92);
		}
		levels = next;
		rafId = requestAnimationFrame(tickMeter);
	}

	async function setupMeter(mediaStream) {
		audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(mediaStream);
		analyser = audioContext.createAnalyser();
		analyser.fftSize = 256;
		analyser.smoothingTimeConstant = 0.7;
		source.connect(analyser);
		tickMeter();
	}

	function revokeUrl() {
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
			audioUrl = null;
		}
		audioBlob = null;
	}

	function releaseStream() {
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		if (audioContext) {
			audioContext.close().catch(() => {});
			audioContext = null;
		}
		analyser = null;
		stopMeter();
	}

	async function startRecording() {
		errorMessage = '';
		revokeUrl();
		isPlaying = false;
		chunks = [];
		durationMs = 0;
		accumulatedMs = 0;
		status = 'requesting';

		try {
			if (!navigator.mediaDevices?.getUserMedia) {
				throw new Error('이 브라우저는 마이크 녹음을 지원하지 않습니다.');
			}

			stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			});

			const mimeType = pickMimeType();
			mediaRecorder = mimeType
				? new MediaRecorder(stream, { mimeType })
				: new MediaRecorder(stream);

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) chunks.push(event.data);
			};

			mediaRecorder.onstop = () => {
				const type = mediaRecorder?.mimeType || 'audio/webm';
				const blob = new Blob(chunks, { type });
				audioBlob = blob;
				audioUrl = URL.createObjectURL(blob);
				status = 'stopped';
				releaseStream();
				clearTimer();
			};

			mediaRecorder.onerror = () => {
				errorMessage = '녹음 중 오류가 발생했습니다.';
				status = 'error';
				releaseStream();
				clearTimer();
			};

			await setupMeter(stream);
			mediaRecorder.start(250);
			status = 'recording';
			startTimer();
		} catch (err) {
			const message =
				err instanceof DOMException && err.name === 'NotAllowedError'
					? '마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.'
					: err instanceof Error
						? err.message
						: '마이크에 접근할 수 없습니다.';
			errorMessage = message;
			status = 'error';
			releaseStream();
		}
	}

	function pauseRecording() {
		if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
		mediaRecorder.pause();
		if (startedAt !== null) {
			accumulatedMs += Date.now() - startedAt;
			startedAt = null;
		}
		clearTimer();
		stopMeter();
		status = 'paused';
	}

	function resumeRecording() {
		if (!mediaRecorder || mediaRecorder.state !== 'paused') return;
		mediaRecorder.resume();
		status = 'recording';
		startTimer();
		if (analyser) tickMeter();
	}

	function stopRecording() {
		if (!mediaRecorder) return;
		if (mediaRecorder.state === 'inactive') return;
		if (startedAt !== null) {
			accumulatedMs += Date.now() - startedAt;
			startedAt = null;
			durationMs = accumulatedMs;
		}
		mediaRecorder.stop();
		clearTimer();
		stopMeter();
	}

	function togglePlayback() {
		if (!playbackEl || !audioUrl) return;
		if (playbackEl.paused) {
			playbackEl.play();
			isPlaying = true;
		} else {
			playbackEl.pause();
			isPlaying = false;
		}
	}

	function onPlaybackEnded() {
		isPlaying = false;
	}

	onDestroy(() => {
		clearTimer();
		releaseStream();
		revokeUrl();
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
		}
	});
</script>

<section class="recorder" aria-labelledby="recorder-title">
	<header class="recorder__header">
		<p class="recorder__brand">Speaking AI</p>
		<h1 id="recorder-title" class="recorder__title">목소리 녹음</h1>
		<p class="recorder__subtitle">마이크에 말해 보세요. 녹음 상태와 파형을 바로 확인할 수 있습니다.</p>
	</header>

	<div
		class="recorder__stage"
		class:recorder__stage--recording={status === 'recording'}
		class:recorder__stage--paused={status === 'paused'}
		class:recorder__stage--stopped={status === 'stopped'}
		class:recorder__stage--error={status === 'error'}
	>
		<div class="recorder__status" role="status" aria-live="polite">
			<span class="recorder__status-dot" aria-hidden="true"></span>
			<span class="recorder__status-text">{statusLabel}</span>
		</div>

		<p class="recorder__timer" aria-label="녹음 시간">{formatDuration(durationMs)}</p>

		<div class="recorder__wave" aria-hidden="true">
			{#each levels as level, i (i)}
				<span
					class="recorder__bar"
					style="--h: {level}; --i: {i}"
					class:recorder__bar--live={status === 'recording'}
				></span>
			{/each}
		</div>

		{#if errorMessage}
			<p class="recorder__error">{errorMessage}</p>
		{/if}

		<div class="recorder__controls">
			{#if showStart}
				<button type="button" class="btn btn--record" onclick={startRecording} aria-label="녹음 시작">
					<span class="btn__mic" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" width="28" height="28">
							<path
								d="M12 15a3.5 3.5 0 0 0 3.5-3.5V7a3.5 3.5 0 1 0-7 0v4.5A3.5 3.5 0 0 0 12 15Z"
								fill="currentColor"
							/>
							<path
								d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9.5 20.5h5"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
					<span class="btn__label">녹음 시작</span>
				</button>
			{:else if status === 'requesting'}
				<button type="button" class="btn btn--record" disabled aria-label="마이크 연결 중">
					<span class="btn__mic btn__mic--pulse" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" width="28" height="28">
							<path
								d="M12 15a3.5 3.5 0 0 0 3.5-3.5V7a3.5 3.5 0 1 0-7 0v4.5A3.5 3.5 0 0 0 12 15Z"
								fill="currentColor"
							/>
							<path
								d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9.5 20.5h5"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
					<span class="btn__label">연결 중…</span>
				</button>
			{:else if status === 'recording'}
				<button type="button" class="btn btn--ghost" onclick={pauseRecording} aria-label="일시정지">
					<span class="btn__icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
							<rect x="6" y="5" width="4" height="14" rx="1" />
							<rect x="14" y="5" width="4" height="14" rx="1" />
						</svg>
					</span>
					일시정지
				</button>
				<button type="button" class="btn btn--stop" onclick={stopRecording} aria-label="녹음 종료">
					<span class="btn__icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
							<rect x="6" y="6" width="12" height="12" rx="2" />
						</svg>
					</span>
					녹음 종료
				</button>
			{:else if status === 'paused'}
				<button type="button" class="btn btn--record btn--record-sm" onclick={resumeRecording} aria-label="이어하기">
					<span class="btn__mic" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
							<path d="M8.5 5.5v13l11-6.5-11-6.5Z" />
						</svg>
					</span>
					<span class="btn__label">이어하기</span>
				</button>
				<button type="button" class="btn btn--stop" onclick={stopRecording} aria-label="녹음 종료">
					<span class="btn__icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
							<rect x="6" y="6" width="12" height="12" rx="2" />
						</svg>
					</span>
					녹음 종료
				</button>
			{:else if status === 'stopped'}
				<button type="button" class="btn btn--record" onclick={startRecording} aria-label="다시 녹음">
					<span class="btn__mic" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" width="28" height="28">
							<path
								d="M12 15a3.5 3.5 0 0 0 3.5-3.5V7a3.5 3.5 0 1 0-7 0v4.5A3.5 3.5 0 0 0 12 15Z"
								fill="currentColor"
							/>
							<path
								d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9.5 20.5h5"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
					<span class="btn__label">다시 녹음</span>
				</button>
			{/if}
		</div>

		{#if audioUrl}
			<div class="recorder__playback">
				<audio bind:this={playbackEl} src={audioUrl} onended={onPlaybackEnded}></audio>
				<button type="button" class="btn btn--play" onclick={togglePlayback}>
					{isPlaying ? '일시정지' : '들어보기'}
				</button>
				{#if audioBlob}
					<span class="recorder__meta">
						{(audioBlob.size / 1024).toFixed(1)} KB · {audioBlob.type || 'audio'}
					</span>
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	.recorder {
		width: min(100%, 40rem);
		margin-inline: auto;
		display: grid;
		gap: 1.75rem;
	}

	.recorder__header {
		text-align: center;
		display: grid;
		gap: 0.55rem;
	}

	.recorder__brand {
		font-family: var(--font-display);
		font-size: clamp(2rem, 5vw, 2.75rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--ink);
		line-height: 1.05;
		margin: 0;
	}

	.recorder__title {
		font-family: var(--font-body);
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--ink-soft);
		margin: 0;
	}

	.recorder__subtitle {
		margin: 0 auto;
		max-width: 28rem;
		color: var(--muted);
		font-size: 0.95rem;
		line-height: 1.55;
	}

	.recorder__stage {
		position: relative;
		padding: clamp(1.5rem, 4vw, 2.25rem);
		border-radius: 1.75rem;
		background:
			radial-gradient(120% 90% at 50% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 55%),
			linear-gradient(165deg, color-mix(in oklab, white 72%, var(--wash)), color-mix(in oklab, white 55%, var(--wash-deep)));
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		box-shadow:
			0 1px 0 color-mix(in oklab, white 70%, transparent) inset,
			0 24px 48px -28px color-mix(in oklab, var(--ink) 35%, transparent);
		display: grid;
		gap: 1.35rem;
		justify-items: center;
		overflow: hidden;
		transition:
			border-color 280ms ease,
			box-shadow 280ms ease;
	}

	.recorder__stage--recording {
		border-color: color-mix(in oklab, var(--record) 45%, transparent);
		box-shadow:
			0 1px 0 color-mix(in oklab, white 70%, transparent) inset,
			0 24px 48px -24px color-mix(in oklab, var(--record) 40%, transparent);
	}

	.recorder__stage--paused {
		border-color: color-mix(in oklab, var(--warn) 40%, transparent);
	}

	.recorder__stage--stopped {
		border-color: color-mix(in oklab, var(--accent) 35%, transparent);
	}

	.recorder__stage--error {
		border-color: color-mix(in oklab, var(--record) 50%, transparent);
	}

	.recorder__status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--ink-soft);
		padding: 0.35rem 0.8rem;
		border-radius: 999px;
		background: color-mix(in oklab, white 55%, transparent);
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
	}

	.recorder__status-dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: var(--muted);
		transition: background 200ms ease;
	}

	.recorder__stage--recording .recorder__status-dot {
		background: var(--record);
		box-shadow: 0 0 0 0 color-mix(in oklab, var(--record) 55%, transparent);
		animation: pulse-dot 1.4s ease-out infinite;
	}

	.recorder__stage--paused .recorder__status-dot {
		background: var(--warn);
	}

	.recorder__stage--stopped .recorder__status-dot {
		background: var(--accent);
	}

	.recorder__stage--error .recorder__status-dot {
		background: var(--record);
	}

	.recorder__timer {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 8vw, 3.5rem);
		font-weight: 600;
		letter-spacing: -0.03em;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
		line-height: 1;
	}

	.recorder__wave {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.22rem;
		height: 5.5rem;
		width: min(100%, 22rem);
	}

	.recorder__bar {
		display: block;
		width: 0.28rem;
		height: calc(0.5rem + var(--h) * 4.5rem);
		border-radius: 999px;
		background: color-mix(in oklab, var(--accent) 55%, var(--ink));
		opacity: 0.35;
		transform-origin: center;
		transition: height 80ms linear, opacity 200ms ease;
	}

	.recorder__bar--live {
		opacity: 0.85;
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--record) 70%, white),
			var(--accent)
		);
		animation: bar-breathe 1.2s ease-in-out infinite;
		animation-delay: calc(var(--i) * 28ms);
	}

	.recorder__error {
		margin: 0;
		text-align: center;
		color: color-mix(in oklab, var(--record) 80%, var(--ink));
		font-size: 0.9rem;
		line-height: 1.45;
		max-width: 28rem;
	}

	.recorder__controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		justify-content: center;
	}

	.recorder__playback {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		padding-top: 0.25rem;
		border-top: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
	}

	.recorder__meta {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.btn {
		appearance: none;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.8rem 1.25rem;
		border-radius: 999px;
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 600;
		transition:
			transform 160ms ease,
			background 160ms ease,
			color 160ms ease,
			box-shadow 160ms ease,
			opacity 160ms ease;
	}

	.btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.btn:not(:disabled):hover {
		transform: translateY(-1px);
	}

	.btn:not(:disabled):active {
		transform: translateY(0);
	}

	.btn__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.btn__mic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 50%;
		background: color-mix(in oklab, white 22%, transparent);
		border: 2px solid color-mix(in oklab, white 55%, transparent);
		box-shadow:
			0 0 0 3px color-mix(in oklab, white 12%, transparent),
			inset 0 1px 0 color-mix(in oklab, white 35%, transparent);
		color: white;
		flex-shrink: 0;
	}

	.btn__mic--pulse {
		animation: mic-pulse 1.1s ease-in-out infinite;
	}

	.btn__label {
		padding-inline: 0.15rem 0.35rem;
	}

	.btn--record {
		gap: 0.75rem;
		padding: 0.45rem 1.15rem 0.45rem 0.45rem;
		min-height: 4.1rem;
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--record) 82%, white),
			var(--record) 45%,
			color-mix(in oklab, var(--record) 78%, #7a1010)
		);
		color: white;
		border: 1px solid color-mix(in oklab, #7a1010 35%, transparent);
		box-shadow:
			0 1px 0 color-mix(in oklab, white 35%, transparent) inset,
			0 14px 28px -12px color-mix(in oklab, var(--record) 75%, transparent);
	}

	.btn--record:not(:disabled):hover {
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--record) 70%, white),
			color-mix(in oklab, var(--record) 92%, #7a1010)
		);
	}

	.btn--record:not(:disabled):active .btn__mic {
		transform: scale(0.94);
	}

	.btn--record-sm {
		min-height: 3.35rem;
		padding: 0.35rem 1rem 0.35rem 0.35rem;
		gap: 0.55rem;
	}

	.btn--record-sm .btn__mic {
		width: 2.55rem;
		height: 2.55rem;
	}

	.btn--stop {
		background: var(--ink);
		color: white;
		box-shadow: 0 12px 24px -14px color-mix(in oklab, var(--ink) 70%, transparent);
	}

	.btn--stop:not(:disabled):hover {
		background: color-mix(in oklab, var(--ink) 88%, var(--record));
	}

	.btn--ghost {
		background: color-mix(in oklab, white 55%, transparent);
		color: var(--ink);
		border: 1px solid color-mix(in oklab, var(--ink) 12%, transparent);
	}

	.btn--play {
		background: color-mix(in oklab, var(--accent) 18%, white);
		color: var(--ink);
		border: 1px solid color-mix(in oklab, var(--accent) 35%, transparent);
	}

	@keyframes pulse-dot {
		0% {
			box-shadow: 0 0 0 0 color-mix(in oklab, var(--record) 55%, transparent);
		}
		70% {
			box-shadow: 0 0 0 10px transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}

	@keyframes mic-pulse {
		0%,
		100% {
			box-shadow:
				0 0 0 3px color-mix(in oklab, white 12%, transparent),
				inset 0 1px 0 color-mix(in oklab, white 35%, transparent);
			opacity: 1;
		}
		50% {
			box-shadow:
				0 0 0 6px color-mix(in oklab, white 18%, transparent),
				inset 0 1px 0 color-mix(in oklab, white 35%, transparent);
			opacity: 0.85;
		}
	}

	@keyframes bar-breathe {
		0%,
		100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.15);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.recorder__status-dot,
		.recorder__bar--live,
		.btn__mic--pulse,
		.btn {
			animation: none;
			transition: none;
		}
	}
</style>
