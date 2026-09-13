import type { Keyboard } from '../keyboard/keyboard';
import type { Localized } from '../i18n';

// Exact sizes from the user's design spec (design_src/Piano App.svg —
// "Highlight States" panel: "Glow dot: 32x32px", "Key note indicator:
// 60x60px"). Used at true 1:1 scale, no longer down-scaled — the keyboard
// itself is edge-to-edge now (matching the design's own 1194px-wide iPad
// reference), so there's no container-size mismatch left to correct for.
const TOKEN_SIZE = 32;
const TARGET_RING_SIZE = 60;

// How far up from the bottom of the key the landing target sits, as a
// fraction of the key's own height (0 = at the very bottom edge, 1 = at the
// top of the key). Measured directly from the source design (target ring
// at y=745 within a key spanning y=438-802 → (802-745)/364 ≈ 0.157).
const TARGET_FROM_BOTTOM_FRACTION = 0.157;

export const DEFAULT_BPM = 100;

export const TEMPO_OPTIONS: { value: string; label: Localized; bpm: number }[] = [
  { value: 'slower', label: { en: 'Slower', de: 'Langsamer' }, bpm: 70 },
  { value: 'normal', label: { en: 'Normal', de: 'Normal' }, bpm: DEFAULT_BPM },
  { value: 'faster', label: { en: 'Faster', de: 'Schneller' }, bpm: 140 },
];

/**
 * Renders a falling token that drops from the top of the key down into a
 * landing-zone ring near the bottom of the key that's about to be played.
 * Position is recomputed every animation frame as a function of the audio
 * clock (not a wall-clock timer): if a frame is skipped, the token just
 * catches up next frame instead of drifting.
 *
 * The "this key is expected/next" highlighting itself is NOT drawn here —
 * per the source design, the key's own fill is what changes color (see
 * Keyboard.setExpected/setNext), not a separate overlay shape sitting on
 * top of the keyboard. This class only owns the token + its landing ring.
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

  /** @param durationSeconds how long the token takes to fall for THIS note
   *   (driven by the song's rhythm — see main.ts's fallDurationFor). */
  showNote(pitch: string, durationSeconds: number) {
    this.token?.remove();
    this.targetRing?.remove();
    this.activePitch = pitch;
    this.durationSeconds = Math.max(durationSeconds, 0.15);
    this.startAudioTime = this.now();

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
    this.targetRing?.remove();
    this.targetRing = null;
    this.token = null;
    this.activePitch = null;
  }

  /** Removes any token/ring immediately, no pop animation — for leaving a
   *  song mid-way (e.g. switching to Free Play), not for a correct hit. */
  clear() {
    this.token?.remove();
    this.targetRing?.remove();
    this.token = null;
    this.targetRing = null;
    this.activePitch = null;
  }

  private targetY(): number {
    const areaHeight = this.el.clientHeight;
    const keyboardHeight = this.keyboard.el.clientHeight;
    return areaHeight - keyboardHeight * TARGET_FROM_BOTTOM_FRACTION;
  }

  private loop = () => {
    if (this.token && this.targetRing && this.activePitch) {
      const elapsed = this.now() - this.startAudioTime;
      const progress = Math.min(1, Math.max(0, elapsed / this.durationSeconds));
      const areaWidth = this.el.clientWidth;
      const targetY = this.targetY();

      const xFrac = this.keyboard.keyCenterXFrac(this.activePitch);
      const centerX = xFrac * areaWidth;

      const y = progress * (targetY - TOKEN_SIZE / 2);
      this.token.style.transform = `translate(${centerX - TOKEN_SIZE / 2}px, ${y}px)`;

      this.targetRing.style.transform = `translate(${centerX - TARGET_RING_SIZE / 2}px, ${targetY - TARGET_RING_SIZE / 2}px)`;
    }
    requestAnimationFrame(this.loop);
  };
}
