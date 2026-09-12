import type { Keyboard } from '../keyboard/keyboard';

const TOKEN_SIZE = 36;

export const DEFAULT_LEAD_TIME = 2.5;

export const SPEED_OPTIONS: { label: string; leadTimeSeconds: number }[] = [
  { label: 'Slower', leadTimeSeconds: 3.5 },
  { label: 'Normal', leadTimeSeconds: DEFAULT_LEAD_TIME },
  { label: 'Faster', leadTimeSeconds: 1.5 },
];

/**
 * Renders a falling token that drops down a highlighted lane toward a hit
 * line right above the keyboard. Position is recomputed every animation
 * frame as a function of the audio clock (not a wall-clock timer), per the
 * "no independent timer" rule: if a frame is skipped, the token just catches
 * up next frame instead of drifting out of sync with the audio.
 *
 * The lane (top of play area -> key) and the hit line (fixed bar just above
 * the keys) are both drawn explicitly, and the token itself lands exactly on
 * the hit line and pulses once it arrives — the timing cue is meant to read
 * as "tap when the ball touches the line", not just "a ball is somewhere
 * above a key".
 */
export class FallingNotes {
  readonly el: HTMLDivElement;
  private keyboard: Keyboard;
  private now: () => number;
  private leadTimeSeconds: number;
  private hitLine: HTMLDivElement;
  private lane: HTMLDivElement | null = null;
  private token: HTMLDivElement | null = null;
  private activePitch: string | null = null;
  private startAudioTime = 0;

  constructor(container: HTMLElement, keyboard: Keyboard, now: () => number, leadTimeSeconds = DEFAULT_LEAD_TIME) {
    this.keyboard = keyboard;
    this.now = now;
    this.leadTimeSeconds = leadTimeSeconds;
    this.el = document.createElement('div');
    this.el.className = 'falling-area';
    container.appendChild(this.el);

    this.hitLine = document.createElement('div');
    this.hitLine.className = 'hit-line';
    this.el.appendChild(this.hitLine);

    requestAnimationFrame(this.loop);
  }

  /** Adjusts how far in advance (seconds) a token starts falling — the difficulty knob. */
  setLeadTime(seconds: number) {
    this.leadTimeSeconds = seconds;
  }

  showNote(pitch: string) {
    this.token?.remove();
    this.lane?.remove();
    this.activePitch = pitch;
    this.startAudioTime = this.now();

    this.lane = document.createElement('div');
    this.lane.className = 'falling-lane';
    this.el.appendChild(this.lane);

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
    this.lane = null;
    this.token = null;
    this.activePitch = null;
  }

  private loop = () => {
    if (this.token && this.lane && this.activePitch) {
      const elapsed = this.now() - this.startAudioTime;
      const progress = Math.min(1, Math.max(0, elapsed / this.leadTimeSeconds));
      const areaHeight = this.el.clientHeight;
      const areaWidth = this.el.clientWidth;
      const xFrac = this.keyboard.keyCenterXFrac(this.activePitch);
      const centerX = xFrac * areaWidth;
      const y = progress * (areaHeight - TOKEN_SIZE);

      this.token.style.transform = `translate(${centerX - TOKEN_SIZE / 2}px, ${y}px)`;
      this.token.classList.toggle('falling-token-waiting', progress >= 1);

      const laneWidth = TOKEN_SIZE * 0.7;
      this.lane.style.left = `${centerX - laneWidth / 2}px`;
      this.lane.style.width = `${laneWidth}px`;
      this.lane.style.height = `${areaHeight}px`;
    }
    requestAnimationFrame(this.loop);
  };
}
