import './style.css';
import { AudioEngine } from './audio/engine';
import { Keyboard, RANGE_OPTIONS, DEFAULT_RANGE } from './keyboard/keyboard';
import type { KeyRange } from './keyboard/keyboard';
import { FallingNotes } from './falling-notes/falling-notes';
import { Notation } from './notation/notation';
import { SONG_LIBRARY } from './song/types';
import type { NoteEvent } from './song/types';

const RANGE_STORAGE_KEY = 'littlePiano.keyRangeLabel';

function loadSavedRange(): KeyRange {
  try {
    const savedLabel = localStorage.getItem(RANGE_STORAGE_KEY);
    const found = RANGE_OPTIONS.find((o) => o.label === savedLabel);
    return found ? found.range : DEFAULT_RANGE;
  } catch {
    return DEFAULT_RANGE;
  }
}

function saveRange(label: string) {
  try {
    localStorage.setItem(RANGE_STORAGE_KEY, label);
  } catch {
    // ignore (e.g. private browsing storage restrictions)
  }
}

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '';

const header = document.createElement('header');
header.className = 'app-header';
header.innerHTML = `<h1>🎹 Little Piano</h1>`;
app.appendChild(header);

const rangePicker = document.createElement('div');
rangePicker.className = 'range-picker';
app.appendChild(rangePicker);

const picker = document.createElement('section');
picker.className = 'song-picker';
app.appendChild(picker);

const playScreen = document.createElement('section');
playScreen.className = 'play-screen';
playScreen.hidden = true;
app.appendChild(playScreen);

const backBtn = document.createElement('button');
backBtn.className = 'back-btn';
backBtn.textContent = '‹ Songs';
playScreen.appendChild(backBtn);

const songTitleEl = document.createElement('h2');
songTitleEl.className = 'song-title';
playScreen.appendChild(songTitleEl);

const notationContainer = document.createElement('div');
notationContainer.className = 'notation-container';
playScreen.appendChild(notationContainer);

const stage = document.createElement('div');
stage.className = 'stage';
playScreen.appendChild(stage);

const keyboardContainer = document.createElement('div');
keyboardContainer.className = 'keyboard-container';
playScreen.appendChild(keyboardContainer);

const completeBanner = document.createElement('div');
completeBanner.className = 'complete-banner';
completeBanner.hidden = true;
completeBanner.innerHTML = `<div class="complete-card">
  <div class="complete-emoji">🌟</div>
  <div class="complete-text">Well done!</div>
  <div class="complete-actions">
    <button class="btn-primary" id="play-again-btn">Play again</button>
    <button class="btn-secondary" id="choose-song-btn">Choose another song</button>
  </div>
</div>`;
playScreen.appendChild(completeBanner);

SONG_LIBRARY.forEach((song) => {
  const btn = document.createElement('button');
  btn.className = 'song-btn';
  btn.textContent = song.title;
  btn.addEventListener('click', () => openSong(song.id));
  picker.appendChild(btn);
});

const engine = new AudioEngine();
const initialRange = loadSavedRange();
const keyboard = new Keyboard(keyboardContainer, initialRange);
const fallingNotes = new FallingNotes(stage, keyboard, () => engine.now());
const notation = new Notation(notationContainer);

const rangeLabel = document.createElement('span');
rangeLabel.className = 'range-picker-label';
rangeLabel.textContent = 'Keyboard size:';
rangePicker.appendChild(rangeLabel);

const initialLabel = RANGE_OPTIONS.find((o) => o.range === initialRange)?.label ?? RANGE_OPTIONS[0].label;

RANGE_OPTIONS.forEach(({ label, range }) => {
  const btn = document.createElement('button');
  btn.className = 'range-btn';
  btn.textContent = label;
  btn.classList.toggle('range-btn-active', label === initialLabel);
  btn.addEventListener('click', () => {
    keyboard.setRange(range);
    saveRange(label);
    rangePicker.querySelectorAll('.range-btn').forEach((el) => el.classList.remove('range-btn-active'));
    btn.classList.add('range-btn-active');
  });
  rangePicker.appendChild(btn);
});

let currentNotes: NoteEvent[] = [];
let currentIndex = 0;

function showExpectedNote() {
  const note = currentNotes[currentIndex];
  if (!note) return;
  keyboard.setExpected(note.pitch);
  fallingNotes.showNote(note.pitch);
}

function onSongComplete() {
  keyboard.setExpected(null);
  completeBanner.hidden = false;
}

async function openSong(id: string) {
  const meta = SONG_LIBRARY.find((s) => s.id === id);
  if (!meta) return;

  await engine.start();

  picker.hidden = true;
  rangePicker.hidden = true;
  playScreen.hidden = false;
  completeBanner.hidden = true;
  songTitleEl.textContent = meta.title;

  currentNotes = await notation.load(meta.musicXmlUrl);
  currentIndex = 0;
  showExpectedNote();
}

function restartSong() {
  completeBanner.hidden = true;
  currentIndex = 0;
  notation.reload();
  showExpectedNote();
}

keyboard.setOnPress((pitch) => {
  engine.play(pitch);
  if (currentIndex >= currentNotes.length) return;

  const expected = currentNotes[currentIndex];
  if (pitch !== expected.pitch) return;

  keyboard.flashSuccess(pitch);
  fallingNotes.pop();
  notation.advance();

  currentIndex += 1;
  const indexAtAdvance = currentIndex;
  if (currentIndex < currentNotes.length) {
    setTimeout(() => {
      if (currentIndex === indexAtAdvance) showExpectedNote();
    }, 350);
  } else {
    setTimeout(() => {
      if (currentIndex === indexAtAdvance) onSongComplete();
    }, 350);
  }
});

function showPicker() {
  playScreen.hidden = true;
  picker.hidden = false;
  rangePicker.hidden = false;
}

backBtn.addEventListener('click', showPicker);

completeBanner.querySelector('#play-again-btn')!.addEventListener('click', restartSong);
completeBanner.querySelector('#choose-song-btn')!.addEventListener('click', showPicker);
