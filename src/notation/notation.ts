import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { extractNotes } from '../song/extract-notes';
import type { NoteEvent } from '../song/types';

const EXPECTED_COLOR = '#ff6200';

/**
 * Wraps an OSMD instance and drives its cursor one note at a time so the
 * highlighted notehead always matches the note currently expected on the
 * keyboard/falling lane. Notes are extracted from the same OSMD cursor
 * that renders the score, so the falling-note schedule and the notation
 * can never drift out of sync with each other (single source of truth).
 */
export class Notation {
  private osmd: any;
  private scoreHighlight: SVGCircleElement | null = null;

  constructor(container: HTMLElement) {
    this.osmd = new OpenSheetMusicDisplay(container, {
      autoResize: true,
      backend: 'svg',
      // We already show the song title in our own .song-title heading above
      // the score — OSMD's own title (from MusicXML's <work-title>) would
      // just duplicate it.
      drawTitle: false,
      // The design has no instrument/part label ("Piano") beside the staff.
      drawPartNames: false,
    });
  }

  async load(musicXmlUrl: string): Promise<NoteEvent[]> {
    // load() internally calls reset(), which resets zoom to 1 — so the zoom
    // has to be (re)applied after load and before render, every time.
    await this.osmd.load(musicXmlUrl);
    // The design's staff is much more compact than OSMD's default render
    // (measured content height ~75px at full width vs ~172px at zoom 1).
    this.osmd.Zoom = 0.6;
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
    this.updateScoreHighlight(color ? gNotes : []);
  }

  /**
   * A soft circle behind the current notehead ("Score highlight" in the
   * design spec: a 40x40px circle at 20% accent opacity, marking the
   * current note in the sheet music). Sized relative to the notehead's own
   * bounding box rather than a hardcoded px radius, since VexFlow/OSMD's
   * internal SVG coordinate units don't map 1:1 to CSS pixels.
   */
  private updateScoreHighlight(gNotes: any[]) {
    this.scoreHighlight?.remove();
    this.scoreHighlight = null;
    const vfnote = gNotes[0]?.vfnote?.[0];
    const el: SVGGElement | undefined = vfnote?.attrs?.el;
    const notehead = el?.querySelector('.vf-notehead path') as SVGGraphicsElement | null;
    if (!el || !notehead) return;

    const bbox = notehead.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const r = bbox.width * 2.2;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'rgba(255, 98, 0, 0.2)');
    circle.style.pointerEvents = 'none';
    // Insert behind the note (as the note group's previous sibling) so the
    // recolored notehead still renders on top of the halo.
    el.parentElement?.insertBefore(circle, el);
    this.scoreHighlight = circle;
  }
}
