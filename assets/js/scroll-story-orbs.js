/**
 * Scroll-story list icons — thinking-orbs preset "shaping".
 * Docs: https://orbs.jakubantalik.com/
 */
import { MODE_DRAWS, resolvePreset } from 'https://esm.sh/thinking-orbs@0.2.0';

const SIZE = 36;
const mounts = document.querySelectorAll('.scroll-story-orb');
if (!mounts.length) {
  // no-op
} else {
  const { mode, speed: baseSpeed, opts } = resolvePreset('shaping', 64);
  const draw = MODE_DRAWS[mode];
  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const orbs = [];

  mounts.forEach((mount) => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    mount.appendChild(canvas);

    const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(SIZE * dpr);
    canvas.height = Math.round(SIZE * dpr);
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;

    orbs.push({ canvas, dpr });
  });

  const paintAll = (tSec) => {
    for (const { canvas, dpr } of orbs) {
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);
      draw(ctx, SIZE, tSec, true, opts);
    }
  };

  if (reduced) {
    paintAll(0.6);
  } else {
    let running = false;
    let raf = 0;
    let visible = false;

    const loop = () => {
      paintAll((performance.now() / 1000) * baseSpeed);
      if (running) raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const section = document.querySelector('.core-highlight');
    const target = section || mounts[0];

    if (typeof IntersectionObserver !== 'undefined' && target) {
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && document.visibilityState !== 'hidden') start();
        else stop();
      }, { threshold: 0.15 });
      io.observe(target);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') stop();
      else if (visible) start();
    });
  }
}
