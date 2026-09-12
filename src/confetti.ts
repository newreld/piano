const COLORS = ['#ff8c42', '#2ec4b6', '#ffd8ae', '#3a3a4a', '#ffffff'];

/** A quick, non-repeating confetti burst — decorative only, self-cleans up. */
export function burstConfetti(container: HTMLElement, count = 20) {
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    const dx = (Math.random() - 0.5) * 280;
    const rotate = Math.random() * 360;
    const delay = Math.random() * 0.15;
    const duration = 0.9 + Math.random() * 0.6;
    piece.style.setProperty('--dx', `${dx}px`);
    piece.style.setProperty('--rotate', `${rotate}deg`);
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.background = COLORS[i % COLORS.length];
    piece.style.left = `${40 + Math.random() * 20}%`;
    piece.addEventListener('animationend', () => piece.remove());
    container.appendChild(piece);
  }
}
