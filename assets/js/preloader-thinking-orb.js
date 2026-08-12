/**
 * Preloader orb — full-viewport solving shape while the landing boots.
 * Uses thinking-orbs power-user API: resolvePreset + MODE_DRAWS
 * Docs: https://orbs.jakubantalik.com/
 */
import { MODE_DRAWS, resolvePreset } from 'https://esm.sh/thinking-orbs@0.2.0';

const mount = document.getElementById('preloader-thinking-orb');
if (!mount) {
  // Preloader mount not on this page
} else {
  const displaySize = () =>
    Math.max(240, Math.floor(Math.min(window.innerWidth, window.innerHeight)));

  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Cargando Plan Maestro');
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
    // Cap DPR on huge canvases to keep boot smooth
    const rawDpr = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1;
    dpr = size >= 900 ? Math.min(1.5, rawDpr) : Math.min(2, rawDpr);
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
    start();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') stop();
      else start();
    });

    const preloader = document.getElementById('preloader');
    if (preloader && typeof MutationObserver !== 'undefined') {
      const mo = new MutationObserver(() => {
        const hidden =
          preloader.style.display === 'none' ||
          preloader.style.opacity === '0' ||
          !document.body.contains(preloader);
        if (hidden) {
          stop();
          mo.disconnect();
        }
      });
      mo.observe(preloader, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
}
