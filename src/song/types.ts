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
  musicXmlUrl: string;
}

export interface Song extends SongMeta {
  notes: NoteEvent[];
}

export const SONG_LIBRARY: SongMeta[] = [
  { id: 'twinkle-twinkle', title: 'Twinkle Twinkle Little Star', musicXmlUrl: '/songs/twinkle-twinkle.xml' },
  { id: 'hot-cross-buns', title: 'Hot Cross Buns', musicXmlUrl: '/songs/hot-cross-buns.xml' },
  { id: 'mary-had-a-little-lamb', title: 'Mary Had a Little Lamb', musicXmlUrl: '/songs/mary-had-a-little-lamb.xml' },
];
