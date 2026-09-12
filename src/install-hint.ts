const DISMISSED_KEY = 'littlePiano.installHintDismissed';

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

function isStandalone(): boolean {
  return (
    ('standalone' in navigator && (navigator as unknown as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    // ignore (e.g. private browsing storage restrictions)
  }
}

/**
 * A one-time banner explaining how to add the app to the Home Screen on
 * iOS Safari — this is where offline play and full-screen (no browser
 * chrome) actually come from, and the exact steps changed with iOS 26
 * (Share moved behind the ••• menu on some tab-bar settings), so it's
 * worth spelling out rather than assuming a family already knows the path.
 */
export function mountInstallHint(container: HTMLElement) {
  if (!isIOS() || isStandalone() || wasDismissed()) return;

  const banner = document.createElement('div');
  banner.className = 'install-hint';
  banner.innerHTML = `
    <span class="install-hint-text">
      📲 For the best experience (offline play, full screen), add this to your Home Screen:
      tap <strong>••• or Share</strong> in Safari's toolbar, then <strong>"Add to Home Screen."</strong>
    </span>
    <button class="install-hint-dismiss" aria-label="Dismiss">✕</button>
  `;
  container.prepend(banner);

  banner.querySelector('.install-hint-dismiss')!.addEventListener('click', () => {
    dismiss();
    banner.remove();
  });
}
