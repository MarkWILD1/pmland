'use strict';

const { ORIGIN } = require('./problem');

const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';

const KNOWN_PAGES = new Set([
  '/',
  '/index',
  '/antiguo',
  '/bienvenida-email-prime-2026',
  '/bienvenida-prime-2026',
  '/developers',
  '/documentation',
  '/ecosistema',
  '/index-backup-pre-mejoras-docente',
  '/ludix',
  '/privacidad',
  '/rediseno',
  '/terminos',
  '/landing-modal',
  '/assets/pages/dua',
  '/assets/pages/educacion-fisica',
  '/assets/pages/ems-dges',
  '/assets/pages/ems-dgetp',
  '/assets/pages/evalua',
  '/assets/pages/iman-de-alumnos',
  '/assets/pages/metodologias-activas',
  '/assets/pages/plan-2006',
  '/assets/pages/segundas-lenguas',
  '/assets/pages/steam',
  '/assets/pages/tramos1a4',
  '/assets/pages/tramos5y6',
  '/tools/export-orb-only',
  '/tools/logo-export',
  '/tools/rollup-85x200',
]);

const KNOWN_API = new Set([
  '/api/v1/health',
  '/api/v1/site',
  '/api/meta-conversions',
]);

function htmlRelToCleanPath(rel) {
  const normalized = String(rel).split('\\').join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) {
    const dir = normalized.slice(0, -'/index.html'.length);
    return `/${dir}`;
  }
  if (normalized.endsWith('.html')) {
    return `/${normalized.slice(0, -'.html'.length)}`;
  }
  return `/${normalized}`;
}

function homepageMarkdown() {
  return `---
title: Plan Maestro
description: Sitio oficial de Plan Maestro, la calculadora docente y maestro virtual para Uruguay.
canonical_url: ${ORIGIN}/
---

# Plan Maestro

Plan Maestro es la plataforma oficial de planificación educativa para docentes de Uruguay. Funciona como calculadora docente y maestro virtual con inteligencia artificial entrenada en documentación ANEP 2026.

El sitio https://plan-maestro.com presenta el producto. La aplicación está en https://prime.plan-maestro.com y el acceso es con cuenta de Google.

## Qué hace

- Planificaciones y secuencias didácticas alineadas al currículo ANEP 2026
- Calculadora docente para tramo, grado, contenidos y criterios de logro
- Mi Memoria, gestor de documentos, Google Drive y Google Calendar
- Herramientas de aula sin IA, con login de Google

## Seguir

- [Documentación](${ORIGIN}/documentation.html)
- [Plan Maestro developer resources](${ORIGIN}/developers)
- [llms.txt](${ORIGIN}/llms.txt)
- [Sitemap](${ORIGIN}/sitemap.xml)
- [Aplicación](https://prime.plan-maestro.com)
`;
}

function notFoundMarkdown(pathname) {
  const shown = String(pathname || '/').replace(/[\r\n]/g, '').slice(0, 200);
  return `# Not found

Plan Maestro has no page at \`${shown}\`. This URL does not exist on ${ORIGIN}.

Look next at the [llms.txt index](${ORIGIN}/llms.txt), the [sitemap](${ORIGIN}/sitemap.xml), or [Plan Maestro developer resources](${ORIGIN}/developers).
`;
}

module.exports = {
  MARKDOWN_CONTENT_TYPE,
  KNOWN_PAGES,
  KNOWN_API,
  htmlRelToCleanPath,
  homepageMarkdown,
  notFoundMarkdown,
};
