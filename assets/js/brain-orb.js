/**
 * BrainOrb — cerebro de puntos (logo-orb sobre assets/images/brain.png) que se
 * ensambla desde una nube de polvo según el progreso del scroll.
 * Pintor alineado a thinking-orbs (MIT © Jakub Antalik).
 */
import { BRAIN_SETS } from './brain-orb-points.js';

const R_BASE = 0.34;
const R_DEPTH = 0.72;
const INK_FAR = 0.62;
const INK_SPAN = 0.54;
const R_MIN = 0.28;
const CONTOUR_BOOST = 1.05;
const CONTOUR_INK = 0.05;
const TONE_LIFT = 0.26;
const SPHERE = 0.82;
const YAW_AMP = 0.2;
const TILT_AMP = 0.12;
const YAW_SPEED = 0.4;
const TILT_SPEED = 0.31;
const STRIDE = 5;
const SCATTER_RADIUS = 1.12;
const SCATTER_SPIN = 2.4;
const BONE = [246, 241, 233];
const SHADOW = [92, 78, 68];

function hash(n) {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smooth(v) {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
}

function easeOutCubic(v) {
  const t = 1 - clamp01(v);
  return 1 - t * t * t;
}

function makeProj(yaw, tilt, cx, cy, scale) {
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);
  const sy = Math.sin(yaw);
  const cyw = Math.cos(yaw);
  return (x, y, z) => {
    const x1 = x * cyw + z * sy;
    const z1 = -x * sy + z * cyw;
    const y1 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;
    return [cx + x1 * scale, cy - y1 * scale, z2];
  };
}

function inkColor(light, alpha) {
  const t = clamp01(light);
  const r = Math.round(SHADOW[0] + (BONE[0] - SHADOW[0]) * t);
  const g = Math.round(SHADOW[1] + (BONE[1] - SHADOW[1]) * t);
  const b = Math.round(SHADOW[2] + (BONE[2] - SHADOW[2]) * t);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
}

function buildCloud(set) {
  const flat = set.points;
  const count = flat.length / STRIDE;
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const x = flat[i * STRIDE];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points = new Array(count);
  for (let i = 0; i < count; i += 1) {
    const o = i * STRIDE;
    const x = flat[o];
    const kind = flat[o + 4];
    const k = (i + hash(i + 7) * 0.9) / count;
    const sy = 1 - 2 * k;
    const ring = Math.sqrt(Math.max(0, 1 - sy * sy));
    const angle = i * golden;
    const reach = SCATTER_RADIUS * (0.55 + 0.45 * Math.cbrt(hash(i + 31)));
    const across = (x - minX) / (maxX - minX || 1);
    points[i] = {
      x,
      y: flat[o + 1],
      z: flat[o + 2],
      tone: flat[o + 3],
      contour: kind === 0,
      sx: ring * Math.cos(angle) * reach,
      sy: sy * reach,
      sz: ring * Math.sin(angle) * reach,
      delay: clamp01(across * 0.55 + hash(i + 101) * 0.3 + (kind === 0 ? 0 : 0.15)),
      bow: (hash(i + 211) - 0.5) * 0.5,
      phase: hash(i + 401) * Math.PI * 2,
    };
  }
  return { target: set.target, points };
}

const CLOUDS = BRAIN_SETS.map(buildCloud);

function cloudFor(size) {
  return size >= 520 ? CLOUDS[0] : CLOUDS[1];
}

export function mountBrainOrb(host, options = {}) {
  if (!host) return null;
  const sizeOf = typeof options.size === 'function' ? options.size : () => Number(options.size) || 680;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', options.label || 'Cerebro de puntos');
  canvas.style.display = 'block';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedQuery.matches;
  let size = 0;
  let cloud = null;
  let dots = [];
  let progress = reduced ? 1 : 0;
  let visible = false;
  let pageVisible = document.visibilityState !== 'hidden';
  let running = false;
  let raf = 0;
  let idleStart = 0;
  let idleClock = 0;

  const resize = () => {
    const next = Math.round(sizeOf());
    if (next === size) return;
    size = next;
    cloud = cloudFor(size);
    dots = cloud.points.map(() => ({ x: 0, y: 0, z: 0, r: 1, light: 0, a: 1 }));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const paint = (seconds) => {
    const p = clamp01(progress);
    const settled = smooth((p - 0.82) / 0.18);
    const t = reduced ? 0 : seconds;
    const idle = reduced ? 0 : idleClock;
    const yaw = YAW_AMP * Math.sin(idle * YAW_SPEED) * settled;
    const tilt = TILT_AMP * Math.sin(idle * TILT_SPEED) * settled;
    const project = makeProj(yaw, tilt, size / 2, size / 2, (size / 2) * SPHERE);
    const scale = (size / 300) ** 0.6 * (size / cloud.target) ** 0.4;
    const spin = (1 - easeOutCubic(p / 0.85)) * SCATTER_SPIN + t * 0.05 * (1 - settled);
    const cs = Math.cos(spin);
    const sn = Math.sin(spin);
    const appear = smooth(p / 0.08) * 0.75 + 0.25;
    const sweep = settled * (reduced ? 0 : 1);
    const pts = cloud.points;

    for (let i = 0; i < pts.length; i += 1) {
      const pt = pts[i];
      const land = easeOutCubic((p - 0.04 - pt.delay * 0.52) / 0.3);
      const drift = (1 - land) * 0.025;
      const ax = pt.sx * cs + pt.sz * sn + Math.sin(t * 0.7 + pt.phase) * drift;
      const ay = pt.sy + Math.cos(t * 0.6 + pt.phase) * drift;
      const az = -pt.sx * sn + pt.sz * cs;
      const dx = pt.x - ax;
      const dy = pt.y - ay;
      const lift = Math.sin(land * Math.PI) * pt.bow;
      const x = ax + dx * land - dy * lift;
      const y = ay + dy * land + dx * lift;
      const z = az + (pt.z - az) * land;
      const projected = project(x, y, z);
      const depth = (projected[2] + 1) / 2;
      let white = INK_FAR - INK_SPAN * depth - (pt.contour ? CONTOUR_INK : 0);
      white += (1 - pt.tone) * TONE_LIFT;
      let light = 1 - clamp01(white);
      if (sweep > 0) {
        const wave = Math.sin(idle * 1.15 - pt.x * 5.5 - pt.y * 3.2);
        light += Math.pow(Math.max(0, wave), 14) * 0.32 * sweep;
      }
      const dot = dots[i];
      dot.x = projected[0];
      dot.y = projected[1];
      dot.z = projected[2];
      dot.light = light * (0.55 + 0.45 * land);
      dot.r = Math.max(R_MIN, (R_BASE + R_DEPTH * depth) * (pt.contour ? CONTOUR_BOOST : 1) * scale) * (0.62 + 0.38 * land);
      const back = projected[2] < -0.15 ? Math.max(0, (projected[2] + 1) / 0.85) : 1;
      dot.a = back * (0.35 + 0.65 * land) * appear;
    }

    const order = dots.slice().sort((a, b) => a.z - b.z);
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < order.length; i += 1) {
      const dot = order[i];
      if (dot.a < 0.02) continue;
      ctx.fillStyle = inkColor(dot.light, dot.a);
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const frame = (now) => {
    const seconds = now / 1000;
    if (progress >= 0.82) {
      if (!idleStart) idleStart = seconds - idleClock;
      idleClock = seconds - idleStart;
    } else {
      idleStart = 0;
    }
    paint(seconds);
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || reduced || !visible || !pageVisible) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  resize();
  paint(0);

  reducedQuery.addEventListener('change', () => {
    reduced = reducedQuery.matches;
    if (reduced) {
      stop();
      progress = 1;
      paint(0);
    } else {
      start();
    }
  });

  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry && entry.isIntersecting);
        if (visible) start();
        else stop();
      },
      { threshold: 0.05 }
    ).observe(canvas);
  } else {
    visible = true;
    start();
  }

  document.addEventListener('visibilitychange', () => {
    pageVisible = document.visibilityState !== 'hidden';
    if (pageVisible) start();
    else stop();
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (!running) paint(performance.now() / 1000);
    }, 150);
  });

  return {
    setProgress(value) {
      progress = reduced ? 1 : clamp01(value);
      if (!running) paint(performance.now() / 1000);
    },
  };
}
