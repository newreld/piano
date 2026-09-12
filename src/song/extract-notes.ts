import type { NoteEvent } from './types';

// OSMD's public .d.ts doesn't expose every internal field we need (Pitch,
// FundamentalNote, Length), so the iterator/note/pitch objects below are
// treated as `any`. This mirrors the walk pattern from OSMD's own
// "extracting note timing" wiki example.

// OSMD's Pitch.FundamentalNote is a semitone-class value, not a 0-6 index:
// C=0, D=2, E=4, F=5, G=7, A=9, B=11 (naturals only; accidentals are separate).
const FUNDAMENTAL_TO_STEP: Record<number, string> = {
  0: 'C',
  2: 'D',
  4: 'E',
  5: 'F',
  7: 'G',
  9: 'A',
  11: 'B',
};

// OSMD's Pitch.Octave is offset by -3 from scientific pitch notation
// (middle C / MusicXML octave 4 comes back as OSMD Octave 1).
const OSMD_OCTAVE_OFFSET = 3;

function pitchToString(osmdPitch: any): string | null {
  if (!osmdPitch) return null;
  const step = FUNDAMENTAL_TO_STEP[osmdPitch.FundamentalNote as number];
  if (!step) return null;
  const alter = osmdPitch.AccidentalHalfTones ?? 0;
  const accidental = alter > 0 ? '#'.repeat(alter) : alter < 0 ? 'b'.repeat(-alter) : '';
  return `${step}${accidental}${osmdPitch.Octave + OSMD_OCTAVE_OFFSET}`;
}

/**
 * Walks the OSMD cursor from the start of the piece and collects every
 * sounding note as a { pitch, beat, beats } event, in quarter-note beats
 * from the start of the song. Leaves the cursor reset to the first note
 * afterwards so playback can drive it forward with cursor.next().
 */
export function extractNotes(osmd: any): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const cursor = osmd.cursor;
  cursor.reset();

  while (!cursor.iterator.EndReached) {
    const beat = cursor.iterator.currentTimeStamp.RealValue * 4;
    const voiceEntries = cursor.iterator.CurrentVoiceEntries;
    if (voiceEntries) {
      for (const entry of voiceEntries) {
        for (const note of entry.Notes) {
          if (!note || note.isRest?.()) continue;
          const pitch = pitchToString(note.Pitch);
          if (!pitch) continue;
          const beats = (note.Length?.RealValue ?? 0.25) * 4;
          notes.push({ pitch, beat, beats });
        }
      }
    }
    cursor.iterator.moveToNext();
  }

  cursor.reset();
  return notes;
}
