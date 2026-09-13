import './style.css';
import { mountInstallHint } from './install-hint';
import { burstConfetti } from './confetti';
import { AudioEngine } from './audio/engine';
import { Keyboard, RANGE_OPTIONS, DEFAULT_RANGE } from './keyboard/keyboard';
import type { KeyRange } from './keyboard/keyboard';
import { FallingNotes, TEMPO_OPTIONS, DEFAULT_BPM } from './falling-notes/falling-notes';
import { Notation } from './notation/notation';
import { SONG_LIBRARY } from './song/types';
import type { NoteEvent } from './song/types';
import { t, UI } from './i18n';
import type { Localized } from './i18n';

// The app's own icon (design_src/Piano Icon.png, rasterized into
// public/icon-*.png) — used wherever the design shows the app symbol,
// rather than the 🎹 emoji glyph.
const appIconUrl = `${import.meta.env.BASE_URL}icon-192.png`;

// #app's height reads this custom property before falling back to 100dvh
// (see style.css). Installed as a PWA on iPad, 100dvh/100vh have a known
// WebKit bug where the value on first paint can be measured too tall —
// leaving a dead gap below the keyboard/shelf until something (a scroll, a
// resize) forces a recalculation. Measuring window.innerHeight directly in
// JS avoids that first-paint bug outright, and covers real size changes
// (rotating the iPad, the on-screen keyboard opening) the same way.
function setAppHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
window.addEventListener('pageshow', setAppHeight);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) setAppHeight();
});
window.visualViewport?.addEventListener('resize', setAppHeight);
window.visualViewport?.addEventListener('scroll', setAppHeight);
// A standalone PWA launch on iPad can still report a transient
// window.innerHeight before iOS finishes settling into its final
// fullscreen size — none of the events above necessarily fire for that
// (nothing "resizes" from the page's point of view). Re-measuring a few
// times right after load catches the correction without polling forever.
[50, 150, 300, 600, 1200].forEach((delay) => setTimeout(setAppHeight, delay));

const RANGE_STORAGE_KEY = 'littlePiano.keyRangeValue';
const SPEED_STORAGE_KEY = 'littlePiano.ballSpeedValue';

function loadSavedRange(): KeyRange {
  try {
    const savedValue = localStorage.getItem(RANGE_STORAGE_KEY);
    const found = RANGE_OPTIONS.find((o) => o.value === savedValue);
    return found ? found.range : DEFAULT_RANGE;
  } catch {
    return DEFAULT_RANGE;
  }
}

function saveRange(value: string) {
  try {
    localStorage.setItem(RANGE_STORAGE_KEY, value);
  } catch {
    // ignore (e.g. private browsing storage restrictions)
  }
}

function loadSavedBpm(): number {
  try {
    const savedValue = localStorage.getItem(SPEED_STORAGE_KEY);
    const found = TEMPO_OPTIONS.find((o) => o.value === savedValue);
    return found ? found.bpm : DEFAULT_BPM;
  } catch {
    return DEFAULT_BPM;
  }
}

function saveSpeed(value: string) {
  try {
    localStorage.setItem(SPEED_STORAGE_KEY, value);
  } catch {
    // ignore (e.g. private browsing storage restrictions)
  }
}

/** Builds a "N options, one active" segmented control. Returns the element and a setter to sync active state from outside (e.g. on load). */
function buildSegmented<T extends { value: string; label: Localized }>(
  options: T[],
  initialValue: string,
  onSelect: (opt: T) => void,
): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'segmented';
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'segmented-btn';
    btn.textContent = t(opt.label);
    btn.classList.toggle('segmented-btn-active', opt.value === initialValue);
    btn.addEventListener('click', () => {
      el.querySelectorAll('.segmented-btn').forEach((b) => b.classList.remove('segmented-btn-active'));
      btn.classList.add('segmented-btn-active');
      onSelect(opt);
    });
    el.appendChild(btn);
  });
  return el;
}

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '';

mountInstallHint(app);

// ---------- Home screen ----------

const homeScreen = document.createElement('section');
homeScreen.className = 'home-screen';
app.appendChild(homeScreen);

const topBar = document.createElement('div');
topBar.className = 'top-bar';
homeScreen.appendChild(topBar);

const rangeRow = document.createElement('div');
rangeRow.className = 'picker-row';
const rangeRowLabel = document.createElement('span');
rangeRowLabel.className = 'picker-row-label';
rangeRowLabel.textContent = t(UI.keyboardLabel);
rangeRow.appendChild(rangeRowLabel);
topBar.appendChild(rangeRow);

const speedRow = document.createElement('div');
speedRow.className = 'picker-row';
const speedRowLabel = document.createElement('span');
speedRowLabel.className = 'picker-row-label';
speedRowLabel.textContent = t(UI.tempoLabel);
speedRow.appendChild(speedRowLabel);
topBar.appendChild(speedRow);

const hero = document.createElement('div');
hero.className = 'hero';
hero.innerHTML = `<img class="hero-icon" src="${appIconUrl}" alt="" /><h1 class="hero-title">${t(UI.heroTitle)}</h1>`;
homeScreen.appendChild(hero);

const shelf = document.createElement('div');
shelf.className = 'shelf';
homeScreen.appendChild(shelf);

const loadingNotice = document.createElement('div');
loadingNotice.className = 'loading-notice';
loadingNotice.textContent = t(UI.loadingPianoSounds);
shelf.appendChild(loadingNotice);

const carousel = document.createElement('div');
carousel.className = 'carousel';
shelf.appendChild(carousel);

const freePlayCard = document.createElement('button');
freePlayCard.className = 'card';
freePlayCard.disabled = true;
freePlayCard.innerHTML = `<img class="card-icon" src="${appIconUrl}" alt="" /><div class="card-title">${t(UI.heroTitle)}</div><div class="card-subtitle">${t(UI.freePlay)}</div>`;
freePlayCard.addEventListener('click', () => openFreePlay());
carousel.appendChild(freePlayCard);

const cardButtons: HTMLButtonElement[] = [freePlayCard];

SONG_LIBRARY.forEach((song) => {
  const card = document.createElement('button');
  card.className = 'card';
  card.disabled = true;
  card.innerHTML = `<div class="card-icon">${song.emoji}</div><div class="card-title">${t(song.title)}</div><div class="card-subtitle">${t(song.subtitle)}</div>`;
  card.addEventListener('click', () => openSong(song.id));
  carousel.appendChild(card);
  cardButtons.push(card);
});

// ---------- Play screen ----------

const playScreen = document.createElement('section');
playScreen.className = 'play-screen';
playScreen.hidden = true;
app.appendChild(playScreen);

const songHeader = document.createElement('div');
songHeader.className = 'song-header';
playScreen.appendChild(songHeader);

const homeIconBtn = document.createElement('button');
homeIconBtn.className = 'song-header-emoji';
homeIconBtn.innerHTML = `<img src="${appIconUrl}" alt="" />`;
homeIconBtn.setAttribute('aria-label', t(UI.backToSongs));
songHeader.appendChild(homeIconBtn);

const songTitleEl = document.createElement('h2');
songTitleEl.className = 'song-title';
songHeader.appendChild(songTitleEl);

const notationContainer = document.createElement('div');
notationContainer.className = 'notation-container';
playScreen.appendChild(notationContainer);

// Keyboard and falling notes share this one container so a key's x-position
// means the same thing in both — see FallingNotes' class doc for why that
// matters (two differently-capped-width containers is what caused tokens
// to land beside the wrong key on wide screens).
const pianoStage = document.createElement('div');
pianoStage.className = 'piano-stage';
playScreen.appendChild(pianoStage);

// Behind everything else in the stage — the distinct background band the
// keyboard sits on, per the source design.
const pianoStageShelf = document.createElement('div');
pianoStageShelf.className = 'piano-stage-shelf';
pianoStage.appendChild(pianoStageShelf);

const completeBanner = document.createElement('div');
completeBanner.className = 'complete-banner';
completeBanner.hidden = true;
completeBanner.innerHTML = `<div class="complete-card">
  <div class="complete-text">${t(UI.wellDone)}</div>
  <div class="complete-actions">
    <button class="btn-primary" id="play-again-btn">${t(UI.playAgain)}</button>
    <button class="btn-secondary" id="choose-song-btn">${t(UI.chooseAnotherSong)}</button>
  </div>
</div>`;
playScreen.appendChild(completeBanner);

// ---------- Wiring ----------

const engine = new AudioEngine();
engine.whenLoaded().then(() => {
  loadingNotice.hidden = true;
  cardButtons.forEach((btn) => (btn.disabled = false));
});

const initialRange = loadSavedRange();
const keyboard = new Keyboard(pianoStage, initialRange);
const fallingNotes = new FallingNotes(pianoStage, keyboard, () => engine.now());
const notation = new Notation(notationContainer);

// Every song is composed to fit within one octave, so widening the range
// during a song never unlocks anything real — it just spreads the same
// keys thinner across the same width, making the target key harder to
// hit. The picker (only ever visible on the home screen, never during a
// song or Free Play) only ever governs Free Play's range; songs always
// force one octave, applied in openSong() below.
let freePlayRange = initialRange;

const initialRangeValue = RANGE_OPTIONS.find((o) => o.range === initialRange)?.value ?? RANGE_OPTIONS[0].value;
rangeRow.appendChild(
  buildSegmented(RANGE_OPTIONS, initialRangeValue, ({ range, value }) => {
    freePlayRange = range;
    saveRange(value);
  }),
);

const initialBpm = loadSavedBpm();
let secondsPerBeat = 60 / initialBpm;
const initialSpeedValue = TEMPO_OPTIONS.find((o) => o.bpm === initialBpm)?.value ?? TEMPO_OPTIONS[1].value;
speedRow.appendChild(
  buildSegmented(TEMPO_OPTIONS, initialSpeedValue, ({ bpm, value }) => {
    secondsPerBeat = 60 / bpm;
    saveSpeed(value);
  }),
);

type Mode = 'song' | 'freeplay';
let mode: Mode = 'song';
let currentNotes: NoteEvent[] = [];
let currentIndex = 0;

// How long (seconds) the token should take to fall for note `index`,
// driven by the actual gap between notes in the score (beats, from the
// MusicXML) rather than a fixed constant — so a half-note's worth of space
// before the next note takes visibly longer than a quarter-note's worth.
// The first note gets a fixed 2-beat lead-in since there's no previous
// note to measure a gap from.
function fallDurationFor(index: number): number {
  const note = currentNotes[index];
  const prevBeat = index === 0 ? note.beat - 2 : currentNotes[index - 1].beat;
  const gapBeats = Math.max(note.beat - prevBeat, 0.25);
  const duration = gapBeats * secondsPerBeat;
  return Math.min(Math.max(duration, 0.5), 5);
}

function showExpectedNote() {
  const note = currentNotes[currentIndex];
  if (!note) return;
  keyboard.setExpected(note.pitch);
  const nextNote = currentNotes[currentIndex + 1];
  keyboard.setNext(nextNote?.pitch ?? null);
  fallingNotes.showNote(note.pitch, fallDurationFor(currentIndex));
}

function onSongComplete() {
  keyboard.setExpected(null);
  keyboard.setNext(null);
  // A beat of silence before the "Well done!" card appears — showing it the
  // instant the last note is hit feels abrupt and its own fanfare sound
  // would just collide with that last note still ringing out.
  setTimeout(() => {
    completeBanner.hidden = false;
    const card = completeBanner.querySelector<HTMLElement>('.complete-card');
    if (card) burstConfetti(card);
  }, 500);
}

function showHome() {
  playScreen.hidden = true;
  homeScreen.hidden = false;
}

function enterPlayScreen() {
  homeScreen.hidden = true;
  playScreen.hidden = false;
  completeBanner.hidden = true;
}

async function openSong(id: string) {
  const meta = SONG_LIBRARY.find((s) => s.id === id);
  if (!meta) return;

  mode = 'song';
  await engine.start();

  enterPlayScreen();
  keyboard.setRange(DEFAULT_RANGE);
  notationContainer.hidden = false;
  songTitleEl.textContent = t(meta.title);

  currentNotes = await notation.load(meta.musicXmlUrl);
  currentIndex = 0;
  showExpectedNote();
}

async function openFreePlay() {
  mode = 'freeplay';
  await engine.start();

  enterPlayScreen();
  keyboard.setRange(freePlayRange);
  notationContainer.hidden = true;
  songTitleEl.textContent = t(UI.freePlay);
  keyboard.setExpected(null);
  keyboard.setNext(null);
  fallingNotes.clear();
}

function restartSong() {
  completeBanner.hidden = true;
  currentIndex = 0;
  notation.reload();
  showExpectedNote();
}

keyboard.setOnPress((pitch) => {
  engine.play(pitch);
  if (mode === 'freeplay') return;
  if (currentIndex >= currentNotes.length) return;

  const expected = currentNotes[currentIndex];
  if (pitch !== expected.pitch) return;

  fallingNotes.pop();
  notation.advance();

  currentIndex += 1;
  // Advance immediately — no artificial pause. The next token's fall
  // duration (fallDurationFor) already reflects the actual gap to this note
  // in the score; tacking on a fixed delay here would throw off that
  // proportion (e.g. a 2-beat gap no longer reading as ~2x a 1-beat gap).
  if (currentIndex < currentNotes.length) {
    showExpectedNote();
  } else {
    onSongComplete();
  }
});

homeIconBtn.addEventListener('click', showHome);

completeBanner.querySelector('#play-again-btn')!.addEventListener('click', restartSong);
completeBanner.querySelector('#choose-song-btn')!.addEventListener('click', showHome);
