import * as Tone from 'tone';

/**
 * Thin wrapper around Tone.js. Starts on a user gesture (required by iOS
 * Safari) and resumes the AudioContext if it gets suspended after the tab
 * is backgrounded / the iPad is locked.
 */
export class AudioEngine {
  private synth: Tone.PolySynth;
  private started = false;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 0.8 },
    }).toDestination();

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

  now(): number {
    return Tone.now();
  }

  play(pitch: string, duration: number | string = '8n') {
    this.synth.triggerAttackRelease(pitch, duration, Tone.now());
  }
}
