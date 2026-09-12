export interface KeyRange {
  /** e.g. 4 for C4 */
  startOctave: number;
  numOctaves: number;
}

export const DEFAULT_RANGE: KeyRange = { startOctave: 4, numOctaves: 1 };

export const RANGE_OPTIONS: { label: string; range: KeyRange }[] = [
  { label: '1 octave', range: { startOctave: 4, numOctaves: 1 } },
  { label: '2 octaves', range: { startOctave: 4, numOctaves: 2 } },
  { label: '3 octaves', range: { startOctave: 3, numOctaves: 3 } },
];

const STEP_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
// Indices (within one 7-note white-key octave block) that have a black key
// right after them: C#, D#, (no E#), F#, G#, A#, (no B#).
const BLACK_AFTER_INDEX = [0, 1, 3, 4, 5];

function generateWhiteKeys(range: KeyRange): string[] {
  const keys: string[] = [];
  for (let o = 0; o < range.numOctaves; o++) {
    const octave = range.startOctave + o;
    for (const step of STEP_ORDER) keys.push(`${step}${octave}`);
  }
  keys.push(`C${range.startOctave + range.numOctaves}`);
  return keys;
}

function generateBlackKeys(range: KeyRange): { pitch: string; afterWhiteIndex: number }[] {
  const blacks: { pitch: string; afterWhiteIndex: number }[] = [];
  for (let o = 0; o < range.numOctaves; o++) {
    const octave = range.startOctave + o;
    const base = o * 7;
    for (const idx of BLACK_AFTER_INDEX) {
      blacks.push({ pitch: `${STEP_ORDER[idx]}#${octave}`, afterWhiteIndex: base + idx });
    }
  }
  return blacks;
}

export type KeyPressHandler = (pitch: string) => void;

export class Keyboard {
  readonly el: HTMLDivElement;
  private keyEls = new Map<string, HTMLDivElement>();
  private onPress: KeyPressHandler | null = null;
  private range: KeyRange;

  constructor(container: HTMLElement, range: KeyRange = DEFAULT_RANGE) {
    this.el = document.createElement('div');
    this.el.className = 'keyboard';

    this.el.addEventListener('pointerdown', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-pitch]');
      if (!target) return;
      e.preventDefault();
      const pitch = target.dataset.pitch!;
      this.flashPress(pitch);
      this.onPress?.(pitch);
    });

    container.appendChild(this.el);

    this.range = range;
    this.build(range);
  }

  setOnPress(handler: KeyPressHandler) {
    this.onPress = handler;
  }

  getRange(): KeyRange {
    return this.range;
  }

  /** Rebuilds the keyboard for a new range (e.g. from a "1/2/3 octaves" picker). */
  setRange(range: KeyRange) {
    this.range = range;
    this.build(range);
  }

  private build(range: KeyRange) {
    this.el.innerHTML = '';
    this.keyEls.clear();

    const whiteKeys = generateWhiteKeys(range);
    const blackKeys = generateBlackKeys(range);

    const whiteRow = document.createElement('div');
    whiteRow.className = 'white-keys';

    whiteKeys.forEach((pitch) => {
      const key = document.createElement('div');
      key.className = 'key key-white';
      key.dataset.pitch = pitch;
      whiteRow.appendChild(key);
      this.keyEls.set(pitch, key);
    });

    this.el.appendChild(whiteRow);

    const whiteWidthPct = 100 / whiteKeys.length;
    blackKeys.forEach(({ pitch, afterWhiteIndex }) => {
      const key = document.createElement('div');
      key.className = 'key key-black';
      key.dataset.pitch = pitch;
      const leftPct = whiteWidthPct * (afterWhiteIndex + 1) - whiteWidthPct * 0.3;
      key.style.left = `${leftPct}%`;
      key.style.width = `${whiteWidthPct * 0.6}%`;
      this.el.appendChild(key);
      this.keyEls.set(pitch, key);
    });
  }

  private flashPress(pitch: string) {
    const el = this.keyEls.get(pitch);
    if (!el) return;
    el.classList.add('key-pressed');
    setTimeout(() => el.classList.remove('key-pressed'), 150);
  }

  setExpected(pitch: string | null) {
    for (const el of this.keyEls.values()) el.classList.remove('key-expected');
    if (pitch) this.keyEls.get(pitch)?.classList.add('key-expected');
  }

  flashSuccess(pitch: string) {
    const el = this.keyEls.get(pitch);
    if (!el) return;
    // Drop the expected-glow immediately so it doesn't fight the success
    // flash for the same `background` property while both are momentarily
    // present (the next note's glow lands on its own key ~350ms later).
    el.classList.remove('key-expected');
    el.classList.add('key-success');
    setTimeout(() => el.classList.remove('key-success'), 300);
  }

  keyCenterXFrac(pitch: string): number {
    const el = this.keyEls.get(pitch);
    if (!el) return 0;
    const boardRect = this.el.getBoundingClientRect();
    const keyRect = el.getBoundingClientRect();
    return (keyRect.left + keyRect.width / 2 - boardRect.left) / boardRect.width;
  }
}
