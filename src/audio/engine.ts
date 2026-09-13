import * as Tone from 'tone';

// Alexander Holm's Salamander Grand Piano (Yamaha C5), CC-BY-3.0, sampled
// every 3 semitones. Hosted by Tone.js's own project as the sample set used
// in their official Sampler examples/docs, so this is a first-party mirror
// rather than a random third party.
const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/';
const SAMPLE_NOTES = [
  'A0', 'C1', 'D#1', 'F#1', 'A1', 'C2', 'D#2', 'F#2', 'A2', 'C3', 'D#3', 'F#3',
  'A3', 'C4', 'D#4', 'F#4', 'A4', 'C5', 'D#5', 'F#5', 'A5', 'C6', 'D#6', 'F#6',
  'A6', 'C7', 'D#7', 'F#7', 'A7', 'C8',
];

function sampleUrls(): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const note of SAMPLE_NOTES) urls[note] = `${note.replace('#', 's')}.mp3`;
  return urls;
}

/**
 * Thin wrapper around Tone.js. Starts on a user gesture (required by iOS
 * Safari) and resumes the AudioContext if it gets suspended after the tab
 * is backgrounded / the iPad is locked.
 */
export class AudioEngine {
  private sampler: Tone.Sampler;
  private started = false;
  private loaded = false;
  private loadedPromise: Promise<void>;

  constructor() {
    this.sampler = new Tone.Sampler({
      urls: sampleUrls(),
      baseUrl: SAMPLE_BASE_URL,
      release: 1,
    }).toDestination();

    this.loadedPromise = Tone.loaded().then(() => {
      this.loaded = true;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Tone.getContext().state !== 'running') {
        void Tone.getContext().resume();
      }
    });
  }

  /** Must be called from inside a user gesture handler (e.g. a tap). */
  async start() {
    if (this.started) return;
    await Tone.start();
    this.started = true;
  }

  isStarted() {
    return this.started;
  }

  isLoaded() {
    return this.loaded;
  }

  /** Resolves once every piano sample has finished loading. */
  whenLoaded(): Promise<void> {
    return this.loadedPromise;
  }

  now(): number {
    return Tone.now();
  }

  play(pitch: string, duration: number | string = '8n') {
    if (!this.loaded) return;
    this.sampler.triggerAttackRelease(pitch, duration, Tone.now());
  }
}
