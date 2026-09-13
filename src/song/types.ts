import type { Localized } from '../i18n';

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
  title: Localized;
  /** Short descriptor shown under the title on the song card (e.g. origin/composer). */
  subtitle: Localized;
  /** Single emoji shown on the song card, evoking the song itself (not a generic note icon). */
  emoji: string;
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

const traditional: Localized = { en: 'Traditional', de: 'Traditionell' };

export const SONG_LIBRARY: SongMeta[] = [
  {
    id: 'frere-jacques',
    title: { en: 'Frère Jacques (Are You Sleeping)', de: 'Bruder Jakob' },
    subtitle: traditional,
    emoji: '😴',
    musicXmlUrl: `${base}songs/frere-jacques.xml`,
  },
  {
    id: 'weisst-du-wieviel-sternlein',
    title: { en: 'Do You Know How Many Little Stars', de: 'Weißt du wieviel Sternlein stehen' },
    subtitle: { en: 'Johann A. P. Schulz', de: 'Johann A. P. Schulz' },
    emoji: '✨',
    musicXmlUrl: `${base}songs/weisst-du-wieviel-sternlein-stehen.xml`,
  },
  {
    id: 'der-mond-ist-aufgegangen',
    title: { en: 'The Moon Has Risen', de: 'Der Mond ist aufgegangen' },
    subtitle: { en: 'Johann A. P. Schulz', de: 'Johann A. P. Schulz' },
    emoji: '🌙',
    musicXmlUrl: `${base}songs/der-mond-ist-aufgegangen.xml`,
  },
  {
    id: 'ich-geh-mit-meiner-laterne',
    title: { en: 'I Walk With My Lantern', de: 'Ich geh mit meiner Laterne' },
    subtitle: traditional,
    emoji: '🏮',
    musicXmlUrl: `${base}songs/ich-geh-mit-meiner-laterne.xml`,
  },
  {
    id: 'jingle-bells',
    // No real German title in common use — sung as "Jingle Bells" there too.
    title: { en: 'Jingle Bells', de: 'Jingle Bells' },
    subtitle: { en: 'James Lord Pierpont', de: 'James Lord Pierpont' },
    emoji: '🔔',
    musicXmlUrl: `${base}songs/jingle-bells.xml`,
  },
  {
    id: 'happy-birthday',
    title: { en: 'Happy Birthday to You', de: 'Zum Geburtstag viel Glück' },
    subtitle: { en: 'Patty & Mildred Hill', de: 'Patty & Mildred Hill' },
    emoji: '🎂',
    musicXmlUrl: `${base}songs/happy-birthday.xml`,
  },
  {
    id: 'wheels-on-the-bus',
    title: { en: 'The Wheels on the Bus', de: 'Die Räder vom Bus' },
    subtitle: traditional,
    emoji: '🚌',
    musicXmlUrl: `${base}songs/wheels-on-the-bus.xml`,
  },
  {
    id: 'alle-meine-entchen',
    title: { en: 'All My Little Ducklings', de: 'Alle meine Entchen' },
    subtitle: traditional,
    emoji: '🦆',
    musicXmlUrl: `${base}songs/alle-meine-entchen.xml`,
  },
  {
    id: 'backe-backe-kuchen',
    title: { en: 'Bake, Bake a Cake', de: 'Backe, backe Kuchen' },
    subtitle: traditional,
    emoji: '🧁',
    musicXmlUrl: `${base}songs/backe-backe-kuchen.xml`,
  },
  {
    id: 'summ-summ-summ',
    title: { en: 'Buzz, Buzz, Buzz (Little Bee)', de: 'Summ, summ, summ' },
    subtitle: traditional,
    emoji: '🐝',
    musicXmlUrl: `${base}songs/summ-summ-summ.xml`,
  },
  {
    id: 'haschen-in-der-grube',
    title: { en: 'Little Bunny in the Hollow', de: 'Häschen in der Grube' },
    subtitle: traditional,
    emoji: '🐰',
    musicXmlUrl: `${base}songs/haschen-in-der-grube.xml`,
  },
  {
    id: 'twinkle-twinkle',
    title: { en: 'Twinkle Twinkle Little Star', de: 'Funkel, funkel, kleiner Stern' },
    subtitle: traditional,
    emoji: '⭐',
    musicXmlUrl: `${base}songs/twinkle-twinkle.xml`,
  },
  {
    id: 'mein-hut',
    title: { en: 'My Hat, It Has Three Corners', de: 'Mein Hut, der hat drei Ecken' },
    subtitle: traditional,
    emoji: '🎩',
    musicXmlUrl: `${base}songs/mein-hut.xml`,
  },
  {
    id: 'when-the-saints',
    title: { en: 'When the Saints Go Marching In', de: 'Wenn die Heiligen marschieren' },
    subtitle: traditional,
    emoji: '🎺',
    musicXmlUrl: `${base}songs/when-the-saints-go-marching-in.xml`,
  },
  {
    id: 'ode-to-joy',
    title: { en: 'Ode to Joy', de: 'An die Freude' },
    subtitle: { en: 'Ludwig van Beethoven', de: 'Ludwig van Beethoven' },
    emoji: '🎼',
    musicXmlUrl: `${base}songs/ode-to-joy.xml`,
  },
  {
    id: 'o-tannenbaum',
    title: { en: 'O Christmas Tree', de: 'O Tannenbaum' },
    subtitle: traditional,
    emoji: '🎄',
    musicXmlUrl: `${base}songs/o-tannenbaum.xml`,
  },
  {
    id: 'fur-elise',
    // "Für Elise" is the title used in English too, not translated.
    title: { en: 'Für Elise', de: 'Für Elise' },
    subtitle: { en: 'Ludwig van Beethoven', de: 'Ludwig van Beethoven' },
    emoji: '💌',
    musicXmlUrl: `${base}songs/fur-elise.xml`,
  },
  {
    id: 'canon-in-d',
    title: { en: 'Canon in D', de: 'Kanon in D-Dur' },
    subtitle: { en: 'Johann Pachelbel', de: 'Johann Pachelbel' },
    emoji: '🎻',
    musicXmlUrl: `${base}songs/canon-in-d.xml`,
  },
  {
    id: 'minuet-in-g',
    title: { en: 'Minuet in G', de: 'Menuett in G-Dur' },
    subtitle: { en: 'Christian Petzold', de: 'Christian Petzold' },
    emoji: '💃',
    musicXmlUrl: `${base}songs/minuet-in-g.xml`,
  },
];
