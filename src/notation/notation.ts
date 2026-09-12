import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { extractNotes } from '../song/extract-notes';
import type { NoteEvent } from '../song/types';

const EXPECTED_COLOR = '#ff8c42';

/**
 * Wraps an OSMD instance and drives its cursor one note at a time so the
 * highlighted notehead always matches the note currently expected on the
 * keyboard/falling lane. Notes are extracted from the same OSMD cursor
 * that renders the score, so the falling-note schedule and the notation
 * can never drift out of sync with each other (single source of truth).
 */
export class Notation {
  private osmd: any;

  constructor(container: HTMLElement) {
    this.osmd = new OpenSheetMusicDisplay(container, {
      autoResize: true,
      backend: 'svg',
      drawTitle: true,
    });
  }

  async load(musicXmlUrl: string): Promise<NoteEvent[]> {
    await this.osmd.load(musicXmlUrl);
    this.osmd.render();
    const notes = extractNotes(this.osmd);
    this.osmd.cursor.reset();
    this.osmd.cursor.show();
    this.colorCurrent(EXPECTED_COLOR);
    return notes;
  }

  /** Reset the cursor back to the first note (e.g. "play again"). */
  reload() {
    this.osmd.cursor.reset();
    this.osmd.cursor.show();
    this.colorCurrent(EXPECTED_COLOR);
  }

  /** Advance the cursor to the next note and move the highlight with it. */
  advance() {
    this.colorCurrent(null);
    this.osmd.cursor.next();
    if (!this.osmd.cursor.iterator.EndReached) {
      this.colorCurrent(EXPECTED_COLOR);
    } else {
      this.osmd.cursor.hide();
    }
  }

  private colorCurrent(color: string | null) {
    const gNotes: any[] = this.osmd.cursor.GNotesUnderCursor?.() ?? [];
    const fill = color ?? '#000000';
    for (const gNote of gNotes) {
      const vfnote = gNote.vfnote?.[0];
      const el: SVGGElement | undefined = vfnote?.attrs?.el;
      if (!el) continue;
      el.querySelectorAll('.vf-notehead path, .vf-stem').forEach((node) => {
        node.setAttribute('fill', fill);
        node.setAttribute('stroke', fill);
      });
    }
  }
}
