/**
 * Hero constellation — organic brain/cloud of outlined triangles (Dala-style).
 */
(() => {
  const mount = document.getElementById('particle-constellation');
  if (!mount) return;

  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Constelación de conocimiento');
  mount.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const PALETTE = [
    '#8052ff', '#a78bfa', '#ffb829', '#ff9f1a', '#15846e', '#2dd4bf',
    '#38bdf8', '#6366f1', '#ec4899', '#f472b6', '#22d3ee', '#ffffff',
    '#c4b5fd', '#67e8f9', '#fbbf24',
  ];

  let dpr = 1;
  let w = 0;
  let h = 0;
  let particles = [];
  let ambient = [];
  let start = 0;
  let raf = 0;
  let running = false;

  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  /** Organic brain / neural cloud in local coords */
  function inBrain(x, y) {
    // Two lobes
    const left = Math.hypot((x + 0.22) / 0.42, (y + 0.02) / 0.36);
    const right = Math.hypot((x - 0.24) / 0.4, (y + 0.04) / 0.34);
    const stem = Math.hypot(x / 0.16, (y - 0.38) / 0.22);
    const core = Math.hypot(x / 0.28, (y + 0.08) / 0.22);

    let inside = false;
    let edge = 1;
    if (left <= 1) {
      inside = true;
      edge = Math.min(edge, left);
    }
    if (right <= 1) {
      inside = true;
      edge = Math.min(edge, right);
    }
    if (stem <= 1 && y > 0.15) {
      inside = true;
      edge = Math.min(edge, stem);
    }
    if (core <= 1) {
      inside = true;
      edge = Math.min(edge, core * 0.85);
    }

    // Wrinkle noise — keep organic silhouette
    if (inside) {
      const n =
        Math.sin(x * 14.2 + y * 9.1) * Math.cos(x * 7.3 - y * 11.8) * 0.08;
      if (edge + n > 0.98) return null;
      return { edge: edge + n };
    }
    return null;
  }

  function sampleBrain(count) {
    const pts = [];
    let guard = 0;
    while (pts.length < count && guard < count * 70) {
      guard += 1;
      const x = (Math.random() * 2 - 1) * 0.72;
      const y = (Math.random() * 2 - 1) * 0.62;
      const hit = inBrain(x, y);
      if (!hit) continue;
      const keep =
        hit.edge > 0.55 ||
        (hit.edge > 0.25 && Math.random() < 0.4) ||
        Math.random() < 0.1;
      if (!keep) continue;
      pts.push({ x, y, edge: hit.edge });
    }
    return pts;
  }

  function makeParticle(p) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.8 + Math.random() * 1.6;
    return {
      tx: p.x,
      ty: p.y,
      x: p.x + Math.cos(angle) * dist,
      y: p.y + Math.sin(angle) * dist,
      size: 1.1 + Math.random() * 2.2,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.9,
      color: pick(PALETTE),
      delay: Math.random() * 0.9,
      drift: 0.004 + Math.random() * 0.014,
      phase: Math.random() * Math.PI * 2,
      outlined: Math.random() > 0.15,
    };
  }

  function rebuild() {
    const rect = mount.getBoundingClientRect();
    w = Math.max(280, Math.floor(rect.width) || 560);
    h = Math.max(320, Math.floor(rect.height) || 560);
    dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const density = w < 420 ? 2200 : w < 700 ? 3800 : 5200;
    particles = sampleBrain(density).map(makeParticle);

    ambient = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 2.5 + Math.random() * 9,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      color: pick(PALETTE),
      alpha: 0.06 + Math.random() * 0.16,
      vx: (Math.random() - 0.5) * 0.00022,
      vy: (Math.random() - 0.5) * 0.00022,
    }));

    start = performance.now();
  }

  function toScreen(lx, ly) {
    const scale = Math.min(w, h) * 0.72;
    return {
      x: w * 0.52 + lx * scale,
      y: h * 0.48 + ly * scale,
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
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
  }

  const ease = (t) => 1 - (1 - t) ** 3;

  function paint(now) {
    const t = (now - start) / 1000;
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

    for (const p of particles) {
      let u = 1;
      if (!reduced) {
        u = ease(Math.max(0, Math.min(1, (t - p.delay) / 1.4)));
      }
      const lx = p.x + (p.tx - p.x) * u;
      const ly = p.y + (p.ty - p.y) * u;
      let ox = 0;
      let oy = 0;
      if (u >= 1) {
        ox = Math.sin(t * p.drift * 38 + p.phase) * 0.008;
        oy = Math.cos(t * p.drift * 30 + p.phase) * 0.008;
        p.rot += p.spin * 0.006;
      } else {
        p.rot += p.spin * 0.04;
      }
      const s = toScreen(lx + ox, ly + oy);
      drawTriangle(s.x, s.y, p.size, p.rot, p.color, p.outlined, 0.4 + 0.55 * u);
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
        ([e]) => {
          visible = e.isIntersecting;
          if (visible && document.visibilityState !== 'hidden') startLoop();
          else stopLoop();
        },
        { threshold: 0.08, rootMargin: '80px' }
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
    resizeTimer = setTimeout(() => {
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
