/**
 * Particle lightbulb — sample a drawn bulb mask, animate triangles into place.
 */
(() => {
  const mount = document.getElementById('particle-lightbulb');
  if (!mount) return;

  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Lámpara de ideas en partículas');
  mount.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const AMBER = ['#ffb829', '#ff9f1a', '#ff7a18', '#ffc857', '#ffd36a'];
  const WHITE = ['#ffffff', '#f5f2ff', '#ebe6ff', '#ddd6fe', '#c4b5fd'];
  const COOL = ['#8052ff', '#6366f1', '#3b82f6', '#22d3ee', '#15846e', '#a78bfa', '#38bdf8', '#2dd4bf'];

  let dpr = 1;
  let w = 0;
  let h = 0;
  let particles = [];
  let ambient = [];
  let start = 0;
  let raf = 0;
  let running = false;

  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  /** Draw classic lightbulb into offscreen mask (unit space → pixel) */
  function buildMask(mw, mh) {
    const off = document.createElement('canvas');
    off.width = mw;
    off.height = mh;
    const o = off.getContext('2d');
    if (!o) return null;

    const cx = mw * 0.5;
    const cy = mh * 0.42;
    const s = Math.min(mw, mh) * 0.42;

    o.fillStyle = '#fff';
    // Glass globe
    o.beginPath();
    o.ellipse(cx, cy - s * 0.05, s * 0.72, s * 0.82, 0, 0, Math.PI * 2);
    o.fill();

    // Neck
    o.beginPath();
    o.moveTo(cx - s * 0.28, cy + s * 0.55);
    o.lineTo(cx + s * 0.28, cy + s * 0.55);
    o.lineTo(cx + s * 0.22, cy + s * 0.95);
    o.lineTo(cx - s * 0.22, cy + s * 0.95);
    o.closePath();
    o.fill();

    // Screw base with ridges
    for (let i = 0; i < 5; i += 1) {
      const y0 = cy + s * (0.95 + i * 0.1);
      const half = s * (0.22 - i * 0.012);
      o.beginPath();
      if (typeof o.roundRect === 'function') {
        o.roundRect(cx - half, y0, half * 2, s * 0.09, 3);
      } else {
        o.rect(cx - half, y0, half * 2, s * 0.09);
      }
      o.fill();
    }
    // Tip
    o.beginPath();
    o.moveTo(cx - s * 0.1, cy + s * 1.45);
    o.lineTo(cx + s * 0.1, cy + s * 1.45);
    o.lineTo(cx, cy + s * 1.62);
    o.closePath();
    o.fill();

    return { canvas: off, ctx: o, cx, cy, s };
  }

  function sampleFromMask(mask, targetCount) {
    const { canvas: off, cx, cy, s } = mask;
    const mw = off.width;
    const mh = off.height;
    const data = mask.ctx.getImageData(0, 0, mw, mh).data;
    const pts = [];

    // Edge-biased sampling via neighborhood emptiness
    const isOn = (x, y) => {
      if (x < 1 || y < 1 || x >= mw - 1 || y >= mh - 1) return false;
      return data[(y * mw + x) * 4 + 3] > 128;
    };

    let guard = 0;
    while (pts.length < targetCount && guard < targetCount * 80) {
      guard += 1;
      const x = (Math.random() * mw) | 0;
      const y = (Math.random() * mh) | 0;
      if (!isOn(x, y)) continue;

      let edge = 0;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          if (!isOn(x + dx, y + dy)) edge += 1;
        }
      }
      // Prefer perimeter (high edge count)
      const keep =
        edge >= 6 ||
        (edge >= 2 && Math.random() < 0.35) ||
        Math.random() < 0.08;
      if (!keep) continue;

      // Normalize to local coords around bulb center
      const lx = (x - cx) / s;
      const ly = (y - cy) / s;

      // Zone by local y
      let zone = 'glass';
      if (ly > 0.55) zone = 'base';
      else if (ly > 0.35) zone = 'neck';

      pts.push({ lx, ly, zone, edge, px: x, py: y });
    }
    return pts;
  }

  function colorFor(p) {
    if (p.zone === 'base') return pick(COOL);
    if (p.zone === 'neck') return Math.random() < 0.45 ? pick(COOL) : pick(WHITE);
    // glass: warm crown (top-left), cool-white body
    if (p.ly < -0.15 && p.lx < 0.15) return pick(AMBER);
    if (p.ly < 0 && p.edge > 8 && Math.random() < 0.45) return pick(AMBER);
    return pick(WHITE);
  }

  function makeParticle(p) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 1.2 + Math.random() * 2.2;
    return {
      tx: p.lx,
      ty: p.ly,
      x: p.lx + Math.cos(angle) * dist,
      y: p.ly + Math.sin(angle) * dist,
      size: 1.8 + Math.random() * 3.4,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.1,
      color: colorFor(p),
      delay: Math.random() * 1.1,
      drift: 0.003 + Math.random() * 0.01,
      phase: Math.random() * Math.PI * 2,
      outlined: Math.random() > 0.1,
    };
  }

  function rebuild() {
    const rect = mount.getBoundingClientRect();
    w = Math.max(320, Math.floor(rect.width) || 560);
    h = Math.max(400, Math.floor(rect.height) || 600);
    dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const maskScale = 0.55;
    const mask = buildMask(Math.round(w * maskScale), Math.round(h * maskScale));
    if (!mask) return;

    const density = w < 420 ? 1800 : w < 700 ? 3200 : 4500;
    particles = sampleFromMask(mask, density).map(makeParticle);

    ambient = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 4 + Math.random() * 14,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
      color: pick([...AMBER, ...COOL, ...WHITE]),
      alpha: 0.05 + Math.random() * 0.14,
      vx: (Math.random() - 0.5) * 0.0002,
      vy: (Math.random() - 0.5) * 0.0002,
    }));

    start = performance.now();
  }

  function toScreen(lx, ly) {
    const tilt = -0.42;
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const rx = lx * cos - ly * sin;
    const ry = lx * sin + ly * cos;
    const scale = Math.min(w, h) * 0.55;
    const cx = w * 0.50;
    const cy = h * 0.46;
    return { x: cx + rx * scale, y: cy + ry * scale };
  }

  function drawTriangle(x, y, size, rot, color, outlined, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.92, size * 0.72);
    ctx.lineTo(-size * 0.92, size * 0.72);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    if (outlined) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
  }

  const easeOutCubic = (t) => 1 - (1 - t) ** 3;

  function paint(now) {
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, w, h);

    const glow = toScreen(-0.25, -0.35);
    const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, Math.min(w, h) * 0.32);
    g.addColorStop(0, 'rgba(255, 184, 41, 0.28)');
    g.addColorStop(0.4, 'rgba(128, 82, 255, 0.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const a of ambient) {
      a.x += a.vx;
      a.y += a.vy;
      a.rot += a.spin * 0.016;
      if (a.x < -0.08) a.x = 1.08;
      if (a.x > 1.08) a.x = -0.08;
      if (a.y < -0.08) a.y = 1.08;
      if (a.y > 1.08) a.y = -0.08;
      drawTriangle(a.x * w, a.y * h, a.size, a.rot, a.color, true, a.alpha);
    }

    for (const p of particles) {
      let u = 1;
      if (!reduced) {
        u = Math.max(0, Math.min(1, (t - p.delay) / 1.5));
        u = easeOutCubic(u);
      }
      const lx = p.x + (p.tx - p.x) * u;
      const ly = p.y + (p.ty - p.y) * u;
      let ox = 0;
      let oy = 0;
      if (u >= 1) {
        ox = Math.sin(t * p.drift * 40 + p.phase) * 0.004;
        oy = Math.cos(t * p.drift * 34 + p.phase) * 0.004;
        p.rot += p.spin * 0.005;
      } else {
        p.rot += p.spin * 0.035;
      }
      const s = toScreen(lx + ox, ly + oy);
      drawTriangle(s.x, s.y, p.size, p.rot, p.color, p.outlined, 0.45 + 0.5 * u);
    }
  }

  const loop = (now) => {
    paint(now);
    if (running) raf = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  rebuild();

  if (reduced) {
    particles.forEach((p) => {
      p.x = p.tx;
      p.y = p.ty;
    });
    paint(performance.now());
  } else {
    let visible = true;
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible && document.visibilityState !== 'hidden') startLoop();
          else stopLoop();
        },
        { threshold: 0.08, rootMargin: '100px' }
      ).observe(mount);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') stopLoop();
      else if (visible) startLoop();
    });
    startLoop();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      rebuild();
      if (reduced) {
        particles.forEach((p) => {
          p.x = p.tx;
          p.y = p.ty;
        });
        paint(performance.now());
      }
    }, 160);
  });
})();
