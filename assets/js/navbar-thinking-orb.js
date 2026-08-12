/**
 * Brand orbs (navbar + footer) — solving shape next to Clash Display wordmark.
 * Uses thinking-orbs power-user API: resolvePreset + MODE_DRAWS
 * Docs: https://orbs.jakubantalik.com/
 */
import { MODE_DRAWS, resolvePreset } from 'https://esm.sh/thinking-orbs@0.2.0';

const SIZE = 36;
const mounts = document.querySelectorAll('.brand-thinking-orb');
if (!mounts.length) {
  // no brand mounts on this page
} else {
  const { mode, speed: baseSpeed, opts } = resolvePreset('solving', 64);
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

    orbs.push({ canvas, dpr, mount });
  });

  const paintOne = ({ canvas, dpr }, tSec) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    draw(ctx, SIZE, tSec, true, opts);
  };

  const resizeAll = () => {
    const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    const t = (performance.now() / 1000) * baseSpeed;
    orbs.forEach((orb) => {
      orb.dpr = dpr;
      orb.canvas.width = Math.round(SIZE * dpr);
      orb.canvas.height = Math.round(SIZE * dpr);
      orb.canvas.style.width = `${SIZE}px`;
      orb.canvas.style.height = `${SIZE}px`;
      paintOne(orb, t);
    });
  };

  if (reduced) {
    orbs.forEach((orb) => paintOne(orb, 0.6));
  } else {
    const visible = new Set();
    let running = false;
    let raf = 0;

    const loop = () => {
      const t = (performance.now() / 1000) * baseSpeed;
      for (const orb of visible) paintOne(orb, t);
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

    const syncLoop = () => {
      if (visible.size > 0 && document.visibilityState !== 'hidden') start();
      else stop();
    };

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const orb = orbs.find((o) => o.mount === entry.target || o.canvas === entry.target);
            if (!orb) continue;
            if (entry.isIntersecting) visible.add(orb);
            else visible.delete(orb);
          }
          syncLoop();
        },
        { threshold: 0.1, rootMargin: '40px' }
      );
      orbs.forEach((orb) => io.observe(orb.mount));
    } else {
      orbs.forEach((orb) => visible.add(orb));
      start();
    }

    document.addEventListener('visibilitychange', syncLoop);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeAll, 150);
  });
}
