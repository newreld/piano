import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { extractNotes } from '../song/extract-notes';
import type { NoteEvent } from '../song/types';

/**
 * Wraps an OSMD instance and drives its cursor one note at a time so the
 * highlighted notehead always matches the note currently expected on the
 * keyboard/falling lane. Notes are extracted from the same OSMD cursor
 * that renders the score, so the falling-note schedule and the notation
 * can never drift out of sync with each other (single source of truth).
 */
export class Notation {
  private osmd: any;
  private container: HTMLElement;
  private scoreHighlight: SVGCircleElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.osmd = new OpenSheetMusicDisplay(container, {
      // Off, deliberately: OSMD's autoResize watches the container for
      // size changes and re-renders (uncropped) in response — but
      // cropToContent() itself shrinks the container (smaller SVG height),
      // which triggered ANOTHER autoResize re-render, wiping the crop, in
      // a feedback loop. That's what caused the notation to intermittently
      // drift off-center after load. We don't need dynamic refitting: the
      // container's width is fixed by CSS, and load() already crops once
      // to fit it correctly.
      autoResize: false,
      backend: 'svg',
      // We already show the song title in our own .song-title heading above
      // the score — OSMD's own title (from MusicXML's <work-title>) would
      // just duplicate it.
      drawTitle: false,
      // The design has no instrument/part label ("Piano") beside the staff.
      drawPartNames: false,
      // OSMD's own cursor is a solid highlight box drawn behind the current
      // note — we have our own subtler circle highlight (see
      // updateScoreHighlight) instead, so make OSMD's invisible (alpha 0)
      // rather than fight two overlapping highlights. It stays otherwise
      // active (`follow: true`) since GNotesUnderCursor()/next() etc. still
      // need a real, positioned cursor under the hood.
      cursorsOptions: [{ type: 0, color: '#000000', alpha: 0, follow: true }],
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
    this.cropToContent();
    const notes = extractNotes(this.osmd);
    this.osmd.cursor.reset();
    this.osmd.cursor.show();
    this.updateScoreHighlight();
    return notes;
  }

  /** Reset the cursor back to the first note (e.g. "play again"). */
  reload() {
    this.osmd.cursor.reset();
    this.osmd.cursor.show();
    this.updateScoreHighlight();
  }

  /** Advance the cursor to the next note and move the highlight with it. */
  advance() {
    this.osmd.cursor.next();
    if (this.osmd.cursor.iterator.EndReached) {
      this.osmd.cursor.hide();
      this.scoreHighlight?.remove();
      this.scoreHighlight = null;
    } else {
      this.updateScoreHighlight();
    }
  }

  /**
   * OSMD lays the score out as if it had a full page's width to fill, and a
   * short single-line song (like all of ours) only uses a fraction of that
   * — left-aligned, with the rest left as dead empty space. Crop the SVG's
   * own viewBox down to its actual rendered content (with a little
   * breathing room) so the notation isn't sitting in a mostly-empty,
   * oversized box; .notation-container centers whatever's left.
   */
  private cropToContent() {
    const svg: SVGSVGElement | null = this.container.querySelector('svg');
    if (!svg) return;
    const viewBox = svg.viewBox.baseVal;
    if (!viewBox || viewBox.width === 0) return;
    const scale = Number(svg.getAttribute('width')) / viewBox.width;

    const bbox = svg.getBBox();
    const pad = 10;
    const x = bbox.x - pad;
    const y = bbox.y - pad;
    const width = bbox.width + pad * 2;
    const height = bbox.height + pad * 2;

    svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    svg.setAttribute('width', String(width * scale));
    svg.setAttribute('height', String(height * scale));
  }

  /**
   * A soft circle behind the current notehead ("Score highlight" in the
   * design spec: a 40x40px circle at 20% accent opacity, marking the
   * current note in the sheet music). Sized relative to the notehead's own
   * bounding box rather than a hardcoded px radius, since VexFlow/OSMD's
   * internal SVG coordinate units don't map 1:1 to CSS pixels.
   */
  private updateScoreHighlight() {
    this.scoreHighlight?.remove();
    this.scoreHighlight = null;

    const gNotes: any[] = this.osmd.cursor.GNotesUnderCursor?.() ?? [];
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
    // notehead still renders on top of the halo.
    el.parentElement?.insertBefore(circle, el);
    this.scoreHighlight = circle;
  }
}
