import type { Keyboard } from '../keyboard/keyboard';

/**
 * Renders a single falling token that drops toward the hit line above the
 * keyboard. Position is recomputed every animation frame as a function of
 * the audio clock (not a wall-clock timer), per the "no independent timer"
 * rule: if a frame is skipped, the token just catches up next frame instead
 * of drifting out of sync with the audio.
 */
export class FallingNotes {
  readonly el: HTMLDivElement;
  private keyboard: Keyboard;
  private now: () => number;
  private leadTimeSeconds: number;
  private token: HTMLDivElement | null = null;
  private activePitch: string | null = null;
  private startAudioTime = 0;

  constructor(container: HTMLElement, keyboard: Keyboard, now: () => number, leadTimeSeconds = 2.5) {
    this.keyboard = keyboard;
    this.now = now;
    this.leadTimeSeconds = leadTimeSeconds;
    this.el = document.createElement('div');
    this.el.className = 'falling-area';
    container.appendChild(this.el);
    requestAnimationFrame(this.loop);
  }

  showNote(pitch: string) {
    this.token?.remove();
    this.activePitch = pitch;
    this.startAudioTime = this.now();
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
    this.token = null;
    this.activePitch = null;
  }

  private loop = () => {
    if (this.token && this.activePitch) {
      const elapsed = this.now() - this.startAudioTime;
      const progress = Math.min(1, Math.max(0, elapsed / this.leadTimeSeconds));
      const areaHeight = this.el.clientHeight;
      const areaWidth = this.el.clientWidth;
      const xFrac = this.keyboard.keyCenterXFrac(this.activePitch);
      const tokenSize = 36;
      const y = progress * (areaHeight - tokenSize);
      this.token.style.transform = `translate(${xFrac * areaWidth - tokenSize / 2}px, ${y}px)`;
    }
    requestAnimationFrame(this.loop);
  };
}
