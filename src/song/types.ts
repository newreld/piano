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

export const SONG_LIBRARY: SongMeta[] = [
  { id: 'frere-jacques', title: 'Bruder Jakob', subtitle: 'Traditionell', emoji: '😴', musicXmlUrl: `${base}songs/frere-jacques.xml` },
  { id: 'weisst-du-wieviel-sternlein', title: 'Weißt du wieviel Sternlein stehen', subtitle: 'Johann A. P. Schulz', emoji: '✨', musicXmlUrl: `${base}songs/weisst-du-wieviel-sternlein-stehen.xml` },
  { id: 'der-mond-ist-aufgegangen', title: 'Der Mond ist aufgegangen (Vereinfacht)', subtitle: 'Johann A. P. Schulz', emoji: '🌙', musicXmlUrl: `${base}songs/der-mond-ist-aufgegangen.xml` },
  { id: 'ich-geh-mit-meiner-laterne', title: 'Ich geh mit meiner Laterne', subtitle: 'Traditionell', emoji: '🏮', musicXmlUrl: `${base}songs/ich-geh-mit-meiner-laterne.xml` },
  { id: 'jingle-bells', title: 'Jingle Bells', subtitle: 'James Lord Pierpont', emoji: '🔔', musicXmlUrl: `${base}songs/jingle-bells.xml` },
  { id: 'happy-birthday', title: 'Zum Geburtstag viel Glück', subtitle: 'Patty & Mildred Hill', emoji: '🎂', musicXmlUrl: `${base}songs/happy-birthday.xml` },
  { id: 'wheels-on-the-bus', title: 'Die Räder vom Bus', subtitle: 'Traditionell', emoji: '🚌', musicXmlUrl: `${base}songs/wheels-on-the-bus.xml` },
  { id: 'alle-meine-entchen', title: 'Alle meine Entchen', subtitle: 'Traditionell', emoji: '🦆', musicXmlUrl: `${base}songs/alle-meine-entchen.xml` },
  { id: 'backe-backe-kuchen', title: 'Backe, backe Kuchen', subtitle: 'Traditionell', emoji: '🧁', musicXmlUrl: `${base}songs/backe-backe-kuchen.xml` },
  { id: 'summ-summ-summ', title: 'Summ, summ, summ', subtitle: 'Traditionell', emoji: '🐝', musicXmlUrl: `${base}songs/summ-summ-summ.xml` },
  { id: 'haschen-in-der-grube', title: 'Häschen in der Grube', subtitle: 'Traditionell', emoji: '🐰', musicXmlUrl: `${base}songs/haschen-in-der-grube.xml` },
  { id: 'twinkle-twinkle', title: 'Funkel, funkel, kleiner Stern', subtitle: 'Traditionell', emoji: '⭐', musicXmlUrl: `${base}songs/twinkle-twinkle.xml` },
  { id: 'mein-hut', title: 'Mein Hut, der hat drei Ecken', subtitle: 'Traditionell', emoji: '🎩', musicXmlUrl: `${base}songs/mein-hut.xml` },
  { id: 'when-the-saints', title: 'Wenn die Heiligen marschieren', subtitle: 'Traditionell', emoji: '🎺', musicXmlUrl: `${base}songs/when-the-saints-go-marching-in.xml` },
  { id: 'ode-to-joy', title: 'An die Freude (Vereinfacht)', subtitle: 'Ludwig van Beethoven', emoji: '🎼', musicXmlUrl: `${base}songs/ode-to-joy.xml` },
  { id: 'o-tannenbaum', title: 'O Tannenbaum (Vereinfacht)', subtitle: 'Traditionell', emoji: '🎄', musicXmlUrl: `${base}songs/o-tannenbaum.xml` },
  { id: 'fur-elise', title: 'Für Elise (Vereinfacht)', subtitle: 'Ludwig van Beethoven', emoji: '💌', musicXmlUrl: `${base}songs/fur-elise.xml` },
  { id: 'canon-in-d', title: 'Kanon in D-Dur (Vereinfacht)', subtitle: 'Johann Pachelbel', emoji: '🎻', musicXmlUrl: `${base}songs/canon-in-d.xml` },
  { id: 'minuet-in-g', title: 'Menuett in G-Dur (Vereinfacht)', subtitle: 'Christian Petzold', emoji: '💃', musicXmlUrl: `${base}songs/minuet-in-g.xml` },
];
