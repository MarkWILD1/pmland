// Empaqueta las nubes de logo-to-orb (t680, t380) en assets/js/brain-orb-points.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../../assets/js/brain-orb-points.js');

function pack(dir) {
  const points = JSON.parse(readFileSync(join(here, dir, 'brain-orb.points.json'), 'utf8'));
  const flat = [];
  for (const p of points) flat.push(p.x, p.y, p.z, p.tone, p.kind);
  return flat.map((v) => +v.toFixed(4)).join(',');
}

const body = `// Generado por tools/brain-orb/build-points.mjs desde logo-to-orb. No editar.
// Cada punto: x, y, z, tono, tipo (0 contorno, 1 relleno).
export const BRAIN_SETS = [
  { target: 680, points: [${pack('t680')}] },
  { target: 380, points: [${pack('t380')}] },
];
`;
writeFileSync(out, body);
console.log(out, (body.length / 1024).toFixed(1) + ' KB');
