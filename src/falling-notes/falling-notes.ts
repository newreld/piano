import type { Keyboard } from '../keyboard/keyboard';

const TOKEN_SIZE = 34;
const TARGET_RING_SIZE = 46;

// How far up from the bottom of the key the landing target sits, as a
// fraction of the key's own height (0 = at the very bottom edge, 1 = at the
// top of the key). 0.25 puts it in the lower quarter of the key, matching
// the "circular target near the bottom of the key" convention from other
// falling-note apps (Synthesia/Simply Piano-style), rather than stopping
// above the keyboard entirely.
const TARGET_FROM_BOTTOM_FRACTION = 0.25;

export const DEFAULT_BPM = 100;

export const TEMPO_OPTIONS: { label: string; bpm: number }[] = [
  { label: 'Slower', bpm: 70 },
  { label: 'Normal', bpm: DEFAULT_BPM },
  { label: 'Faster', bpm: 140 },
];

/**
 * Renders a falling token that drops from the top of the shared piano-stage
 * area down into a landing-zone ring near the bottom of the key that's
 * about to be played. Position is recomputed every animation frame as a
 * function of the audio clock (not a wall-clock timer): if a frame is
 * skipped, the token just catches up next frame instead of drifting.
 *
 * IMPORTANT: this element and the Keyboard's element must be siblings
 * inside the same shared-width parent (see main.ts's `.piano-stage`) so a
 * key's x-position fraction (from `keyboard.keyCenterXFrac`) means the same
 * thing in both coordinate spaces. Splitting them into differently-sized
 * containers (e.g. a capped-width keyboard inside a full-width stage) is
 * what caused tokens to land beside the wrong key on wide/iPad-landscape
 * screens — the fraction was correct, but got multiplied by the wrong
 * container's pixel width.
 */
export class FallingNotes {
  readonly el: HTMLDivElement;
  private keyboard: Keyboard;
  private now: () => number;
  private lane: HTMLDivElement | null = null;
  private token: HTMLDivElement | null = null;
  private targetRing: HTMLDivElement | null = null;
  private activePitch: string | null = null;
  private startAudioTime = 0;
  private durationSeconds = 1;

  constructor(container: HTMLElement, keyboard: Keyboard, now: () => number) {
    this.keyboard = keyboard;
    this.now = now;
    this.el = document.createElement('div');
    this.el.className = 'falling-area';
    container.appendChild(this.el);

    requestAnimationFrame(this.loop);
  }

  /** @param durationSeconds how long the token takes to fall for THIS note (driven by the song's rhythm — see main.ts's fallDurationFor). */
  showNote(pitch: string, durationSeconds: number) {
    this.token?.remove();
    this.lane?.remove();
    this.targetRing?.remove();
    this.activePitch = pitch;
    this.durationSeconds = Math.max(durationSeconds, 0.15);
    this.startAudioTime = this.now();

    this.lane = document.createElement('div');
    this.lane.className = 'falling-lane';
    this.el.appendChild(this.lane);

    this.targetRing = document.createElement('div');
    this.targetRing.className = 'target-ring';
    this.el.appendChild(this.targetRing);

    this.token = document.createElement('div');
    this.token.className = 'falling-token';
    this.el.appendChild(this.token);
  }

  /** Pops the current token (correct key was hit) and clears the active note. */
  pop() {
    const t = this.token;
    if (t) {
      t.classList.add('token-pop');
      setTimeout(() => t.remove(), 250);
    }
    this.lane?.remove();
    this.targetRing?.remove();
    this.lane = null;
    this.targetRing = null;
    this.token = null;
    this.activePitch = null;
  }

  private targetY(): number {
    const areaHeight = this.el.clientHeight;
    const keyboardHeight = this.keyboard.el.clientHeight;
    return areaHeight - keyboardHeight * TARGET_FROM_BOTTOM_FRACTION;
  }

  private loop = () => {
    if (this.token && this.lane && this.targetRing && this.activePitch) {
      const elapsed = this.now() - this.startAudioTime;
      const progress = Math.min(1, Math.max(0, elapsed / this.durationSeconds));
      const areaWidth = this.el.clientWidth;
      const xFrac = this.keyboard.keyCenterXFrac(this.activePitch);
      const centerX = xFrac * areaWidth;
      const targetY = this.targetY();
      const y = progress * (targetY - TOKEN_SIZE / 2);

      this.token.style.transform = `translate(${centerX - TOKEN_SIZE / 2}px, ${y}px)`;
      this.token.classList.toggle('falling-token-waiting', progress >= 1);

      this.targetRing.style.transform = `translate(${centerX - TARGET_RING_SIZE / 2}px, ${targetY - TARGET_RING_SIZE / 2}px)`;

      const laneWidth = TOKEN_SIZE * 0.7;
      this.lane.style.left = `${centerX - laneWidth / 2}px`;
      this.lane.style.width = `${laneWidth}px`;
      this.lane.style.height = `${targetY}px`;
    }
    requestAnimationFrame(this.loop);
  };
}
