/**
 * Hero orb — solving shape at native large canvas size (no CSS upscale).
 * Uses thinking-orbs power-user API: resolvePreset + MODE_DRAWS
 * Docs: https://orbs.jakubantalik.com/
 */
import { MODE_DRAWS, resolvePreset } from 'https://esm.sh/thinking-orbs@0.2.0';

const mount = document.getElementById('hero-thinking-orb');
if (!mount) {
  // Hero mount not on this page
} else {
  const displaySize = () => {
    const w = window.innerWidth;
    if (w <= 575) return 220;
    if (w <= 991) return 280;
    return 340;
  };

  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Plan Maestro IA');
  mount.appendChild(canvas);

  const { mode, speed: baseSpeed, opts } = resolvePreset('solving', 64);
  const draw = MODE_DRAWS[mode];
  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  let size = displaySize();
  let dpr = 1;
  let raf = 0;
  let running = false;

  const paintFrame = (tSec) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    draw(ctx, size, tSec, true, opts);
  };

  const resize = () => {
    size = displaySize();
    dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    paintFrame((performance.now() / 1000) * baseSpeed);
  };

  const loop = () => {
    paintFrame((performance.now() / 1000) * baseSpeed);
    if (running) raf = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  resize();

  if (reduced) {
    paintFrame(0.6);
  } else {
    let visible = true;
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && document.visibilityState !== 'hidden') start();
            else stop();
          })
        : null;
    io?.observe(canvas);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') stop();
      else if (visible) start();
    });
    if (!io) start();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
}
