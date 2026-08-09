/**
 * Feature-card orbs — thinking-orbs presets as card icons.
 * Docs: https://orbs.jakubantalik.com/
 */
import { MODE_DRAWS, resolvePreset } from 'https://esm.sh/thinking-orbs@0.2.0';

const SIZE = 88;
const mounts = document.querySelectorAll('.feature-visual-orb');
if (!mounts.length) {
  // no-op
} else {
  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const orbs = [];

  mounts.forEach((mount) => {
    const preset = mount.getAttribute('data-orb') || 'solving';
    const { mode, speed: baseSpeed, opts } = resolvePreset(preset, 64);
    const draw = MODE_DRAWS[mode];
    if (!draw) return;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    mount.appendChild(canvas);

    const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(SIZE * dpr);
    canvas.height = Math.round(SIZE * dpr);
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;

    orbs.push({ canvas, dpr, draw, opts, baseSpeed, mount });
  });

  const paintOne = ({ canvas, dpr, draw, opts, baseSpeed }, tSec) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    draw(ctx, SIZE, tSec * baseSpeed, true, opts);
  };

  if (reduced) {
    orbs.forEach((orb) => paintOne(orb, 0.6));
  } else {
    const visible = new Set();
    let running = false;
    let raf = 0;

    const loop = () => {
      const t = performance.now() / 1000;
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
        { threshold: 0.2, rootMargin: '80px 0px' }
      );
      orbs.forEach((orb) => io.observe(orb.mount));
    } else {
      orbs.forEach((orb) => visible.add(orb));
      start();
    }

    document.addEventListener('visibilitychange', syncLoop);
  }
}
