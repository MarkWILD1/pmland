/**
 * Scroll-driven particle stage — brain / lamp / earth from Refero reference frames.
 * Triangles morph between sampled point clouds as sections enter the viewport.
 */
(() => {
  const mount = document.getElementById('particle-stage');
  if (!mount) return;

  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  mount.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const SHAPE_URLS = {
    brain: 'assets/data/particles/brain.json',
    lamp: 'assets/data/particles/lamp.json',
    earth: 'assets/data/particles/earth.json',
  };

  const N = 4200;
  let dpr = 1;
  let w = 0;
  let h = 0;
  let particles = [];
  let ambient = [];
  let shapes = { scatter: null, brain: null, lamp: null, earth: null, cloud: null };
  let current = 'scatter';
  let target = 'scatter';
  let morph = 1;
  let morphFrom = 'scatter';
  let raf = 0;
  let running = false;
  let t0 = performance.now();

  const PALETTE = [
    '#8052ff', '#a78bfa', '#ffb829', '#ff9f1a', '#15846e', '#2dd4bf',
    '#38bdf8', '#6366f1', '#ec4899', '#ffffff', '#c4b5fd', '#67e8f9',
  ];
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  function makeScatter() {
    const pts = [];
    for (let i = 0; i < N; i += 1) {
      pts.push({
        x: (Math.random() * 2 - 1) * 1.15,
        y: (Math.random() * 2 - 1) * 0.95,
        c: pick(PALETTE),
      });
    }
    return pts;
  }

  function makeCloud() {
    const pts = [];
    for (let i = 0; i < N; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.55) * 0.85;
      pts.push({
        x: Math.cos(a) * r * 1.1,
        y: Math.sin(a) * r * 0.72,
        c: pick(PALETTE),
      });
    }
    return pts;
  }

  async function loadShape(name, url) {
    const res = await fetch(url);
    const data = await res.json();
    const pts = data.points || [];
    // Ensure fixed length
    const out = [];
    for (let i = 0; i < N; i += 1) {
      const p = pts[i % pts.length];
      out.push({ x: p.x, y: p.y, c: p.c });
    }
    shapes[name] = out;
  }

  function layoutFor(name) {
    // Placement mirrors Dala: brain/earth on right, lamp on left, scatter/cloud center
    if (name === 'lamp') return { ox: -0.22, oy: 0.02, scale: 0.92 };
    if (name === 'brain' || name === 'earth') return { ox: 0.28, oy: 0.0, scale: 0.95 };
    if (name === 'cloud') return { ox: 0, oy: -0.05, scale: 0.7 };
    return { ox: 0, oy: 0, scale: 1.05 };
  }

  function initParticles() {
    particles = [];
    const base = shapes.scatter;
    for (let i = 0; i < N; i += 1) {
      const p = base[i];
      particles.push({
        x: p.x,
        y: p.y,
        tx: p.x,
        ty: p.y,
        fx: p.x,
        fy: p.y,
        c: p.c,
        size: 1.2 + Math.random() * 2.6,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.2,
        phase: Math.random() * Math.PI * 2,
        drift: 0.003 + Math.random() * 0.01,
        outlined: Math.random() > 0.12,
      });
    }

    ambient = Array.from({ length: 64 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 4 + Math.random() * 16,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
      color: pick(PALETTE),
      alpha: 0.05 + Math.random() * 0.14,
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
    }));
  }

  function setTarget(name) {
    if (!shapes[name] || name === target) return;
    morphFrom = current;
    // snapshot current visual positions as from-state
    for (let i = 0; i < N; i += 1) {
      particles[i].fx = particles[i].x;
      particles[i].fy = particles[i].y;
    }
    target = name;
    morph = 0;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function toScreen(lx, ly, layout) {
    const scale = Math.min(w, h) * 0.48 * layout.scale;
    return {
      x: w * (0.5 + layout.ox * 0.5) + lx * scale,
      y: h * (0.5 + layout.oy * 0.5) + ly * scale,
    };
  }

  function drawTriangle(x, y, size, rot, color, outlined, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.9, size * 0.7);
    ctx.lineTo(-size * 0.9, size * 0.7);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    if (outlined) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
  }

  function paint(now) {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);

    for (const a of ambient) {
      a.x += a.vx;
      a.y += a.vy;
      a.rot += a.spin * 0.016;
      if (a.x < -0.05) a.x = 1.05;
      if (a.x > 1.05) a.x = -0.05;
      if (a.y < -0.05) a.y = 1.05;
      if (a.y > 1.05) a.y = -0.05;
      drawTriangle(a.x * w, a.y * h, a.size, a.rot, a.color, true, a.alpha);
    }

    if (!reduced && morph < 1) {
      morph = Math.min(1, morph + 0.018);
      if (morph >= 1) current = target;
    } else if (reduced) {
      morph = 1;
      current = target;
    }

    const u = easeInOut(morph);
    const fromLayout = layoutFor(morphFrom);
    const toLayout = layoutFor(target);
    const fromPts = shapes[morphFrom];
    const toPts = shapes[target];

    for (let i = 0; i < N; i += 1) {
      const p = particles[i];
      const fp = fromPts[i];
      const tp = toPts[i];

      // interpolate in local space then project with blended layout
      const lx = fp.x + (tp.x - fp.x) * u;
      const ly = fp.y + (tp.y - fp.y) * u;
      const layout = {
        ox: fromLayout.ox + (toLayout.ox - fromLayout.ox) * u,
        oy: fromLayout.oy + (toLayout.oy - fromLayout.oy) * u,
        scale: fromLayout.scale + (toLayout.scale - fromLayout.scale) * u,
      };

      let ox = 0;
      let oy = 0;
      if (u >= 0.98) {
        ox = Math.sin(t * p.drift * 40 + p.phase) * 0.006;
        oy = Math.cos(t * p.drift * 34 + p.phase) * 0.006;
        p.rot += p.spin * 0.005;
      } else {
        p.rot += p.spin * 0.03;
      }

      p.x = lx;
      p.y = ly;
      p.c = u > 0.5 ? tp.c : fp.c;

      const s = toScreen(lx + ox, ly + oy, layout);
      const alpha = 0.55 + 0.35 * Math.sin((i % 37) * 0.2 + t * 0.4) * 0.15 + 0.3;
      drawTriangle(s.x, s.y, p.size, p.rot, p.c, p.outlined, Math.min(0.95, alpha));
    }
  }

  const loop = (now) => {
    paint(now);
    if (running) raf = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  function bindScrollShapes() {
    const sections = document.querySelectorAll('[data-shape]');
    if (!sections.length) return;

    const pickActive = () => {
      const mid = window.innerHeight * 0.42;
      let best = null;
      let bestDist = Infinity;
      sections.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 80 || r.top > window.innerHeight - 80) return;
        const c = (r.top + r.bottom) / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) {
          bestDist = d;
          best = el.getAttribute('data-shape');
        }
      });
      if (best) setTarget(best);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        pickActive();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    pickActive();
  }

  (async () => {
    shapes.scatter = makeScatter();
    shapes.cloud = makeCloud();
    await Promise.all([
      loadShape('brain', SHAPE_URLS.brain),
      loadShape('lamp', SHAPE_URLS.lamp),
      loadShape('earth', SHAPE_URLS.earth),
    ]);
    initParticles();
    resize();
    current = 'brain';
    target = 'brain';
    morph = 1;
    // jump particles to brain immediately for first paint
    const brain = shapes.brain;
    for (let i = 0; i < N; i += 1) {
      particles[i].x = brain[i].x;
      particles[i].y = brain[i].y;
      particles[i].c = brain[i].c;
    }
    bindScrollShapes();
    if (reduced) {
      paint(performance.now());
    } else {
      startLoop();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') stopLoop();
        else startLoop();
      });
    }
    window.addEventListener('resize', () => {
      resize();
      if (reduced) paint(performance.now());
    });
  })().catch((err) => {
    console.error('particle-stage failed', err);
  });
})();
