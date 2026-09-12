export interface NoteEvent {
  /** Scientific pitch notation, e.g. "C4", "F#4". Matches Tone.js note naming. */
  pitch: string;
  /** Position in the piece, in quarter-note beats from the start. */
  beat: number;
  /** Duration in quarter-note beats. */
  beats: number;
}

export interface SongMeta {
  id: string;
  title: string;
  /** Short descriptor shown under the title on the song card (e.g. origin/composer). */
  subtitle: string;
  musicXmlUrl: string;
}

export interface Song extends SongMeta {
  notes: NoteEvent[];
}

// import.meta.env.BASE_URL (not a hardcoded leading "/") so these still
// resolve correctly when the app is deployed under a sub-path, e.g. GitHub
// Pages project sites (https://<user>.github.io/<repo>/) — Vite only
// rewrites asset references it can see in index.html/CSS for `base`, not
// arbitrary runtime string literals like these.
const base = import.meta.env.BASE_URL;

export const SONG_LIBRARY: SongMeta[] = [
  { id: 'twinkle-twinkle', title: 'Twinkle Twinkle Little Star', subtitle: 'Traditional', musicXmlUrl: `${base}songs/twinkle-twinkle.xml` },
  { id: 'hot-cross-buns', title: 'Hot Cross Buns', subtitle: 'Traditional', musicXmlUrl: `${base}songs/hot-cross-buns.xml` },
  { id: 'mary-had-a-little-lamb', title: 'Mary Had a Little Lamb', subtitle: 'Traditional', musicXmlUrl: `${base}songs/mary-had-a-little-lamb.xml` },
  { id: 'ode-to-joy', title: 'Ode to Joy (Simplified)', subtitle: 'Beethoven', musicXmlUrl: `${base}songs/ode-to-joy.xml` },
];
