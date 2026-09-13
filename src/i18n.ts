export type Locale = 'en' | 'de';

/** A string with both translations — the only shape UI text is stored in. */
export interface Localized {
  en: string;
  de: string;
}

function detectLocale(): Locale {
  // navigator.languages is the user's full preference list, in priority
  // order (e.g. a bilingual device might report ["en-US", "de-DE"]) — the
  // first entry that matches one of our two supported locales wins, so a
  // German preference lower down the list can't override an earlier,
  // more-preferred one we don't support as if it weren't there.
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of candidates) {
    const primary = lang?.toLowerCase().split('-')[0];
    if (primary === 'de') return 'de';
    if (primary === 'en') return 'en';
  }
  return 'en';
}

/** Detected once from the browser/device's own language list — no in-app
 *  switcher, per the design: it should just match what the device is
 *  already set to. */
export const locale: Locale = detectLocale();

// Keeps the document's own declared language in sync (screen readers,
// spell-check, browser translate prompts all read this) — index.html can
// only ever guess one language statically, so this corrects it at runtime.
document.documentElement.lang = locale;

export function t(text: Localized): string {
  return text[locale];
}

export const UI = {
  heroTitle: { en: 'Piano', de: 'Klavier' },
  freePlay: { en: 'Free Play', de: 'Freies Spiel' },
  keyboardLabel: { en: 'Keyboard', de: 'Tastatur' },
  tempoLabel: { en: 'Tempo', de: 'Tempo' },
  loadingPianoSounds: { en: '🎹 Loading piano sounds…', de: '🎹 Klavierklänge werden geladen…' },
  wellDone: { en: 'Well done!', de: 'Gut gemacht!' },
  playAgain: { en: 'Play again', de: 'Nochmal spielen' },
  chooseAnotherSong: { en: 'Choose another song', de: 'Anderes Lied wählen' },
  backToSongs: { en: 'Back to songs', de: 'Zurück zu den Liedern' },
  installHintText: {
    en: '📲 For the best experience (offline play, full screen), add this to your Home Screen: tap <strong>••• or Share</strong> in Safari\'s toolbar, then <strong>"Add to Home Screen."</strong>',
    de: '📲 Für das beste Erlebnis (Offline-Spiel, Vollbild) füge diese App zu deinem Home-Bildschirm hinzu: Tippe in der Werkzeugleiste von Safari auf <strong>••• oder Teilen</strong>, dann auf <strong>„Zum Home-Bildschirm“</strong>.',
  },
  dismiss: { en: 'Dismiss', de: 'Schließen' },
} satisfies Record<string, Localized>;
