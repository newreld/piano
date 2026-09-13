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
  { id: 'frere-jacques', title: 'Frère Jacques (Are You Sleeping)', subtitle: 'Traditional', musicXmlUrl: `${base}songs/frere-jacques.xml` },
  { id: 'jingle-bells', title: 'Jingle Bells', subtitle: 'J. Pierpont', musicXmlUrl: `${base}songs/jingle-bells.xml` },
  { id: 'happy-birthday', title: 'Happy Birthday to You', subtitle: 'Traditional', musicXmlUrl: `${base}songs/happy-birthday.xml` },
  { id: 'wheels-on-the-bus', title: 'The Wheels on the Bus', subtitle: 'Traditional', musicXmlUrl: `${base}songs/wheels-on-the-bus.xml` },
  { id: 'hush-little-baby', title: 'Hush Little Baby', subtitle: 'Traditional', musicXmlUrl: `${base}songs/hush-little-baby.xml` },
  { id: 'when-the-saints', title: 'When the Saints Go Marching In', subtitle: 'Traditional', musicXmlUrl: `${base}songs/when-the-saints-go-marching-in.xml` },
  { id: 'amazing-grace', title: 'Amazing Grace', subtitle: 'John Newton', musicXmlUrl: `${base}songs/amazing-grace.xml` },
  { id: 'silent-night', title: 'Silent Night', subtitle: 'Franz Gruber', musicXmlUrl: `${base}songs/silent-night.xml` },
  { id: 'ode-to-joy', title: 'Ode to Joy (Simplified)', subtitle: 'Beethoven', musicXmlUrl: `${base}songs/ode-to-joy.xml` },
];
