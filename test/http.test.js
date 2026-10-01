'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { handleAgentRequest } = require('../lib/routes');
const health = require('../api/v1/health');
const site = require('../api/v1/site');

const ROOT = path.join(__dirname, '..');

function contentTypeFor(filePath) {
  if (filePath.endsWith('.json')) return 'application/json';
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (filePath.endsWith('api-catalog')) return 'application/linkset+json';
  return 'text/html; charset=utf-8';
}

function resolveStatic(pathname) {
  if (pathname === '/' || pathname === '/index.html') return path.join(ROOT, 'index.html');
  const clean = pathname.replace(/^\/+/, '');
  const candidates = [
    path.join(ROOT, clean),
    path.join(ROOT, `${clean}.html`),
    path.join(ROOT, clean, 'index.html'),
  ];
  return candidates.find((candidate) => {
    const relative = path.relative(ROOT, candidate);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative) && fs.existsSync(candidate) && fs.statSync(candidate).isFile();
  });
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    const headers = new Headers();
    if (req.headers.accept) headers.set('accept', req.headers.accept);
    const request = new Request(`https://plan-maestro.com${req.url}`, {
      method: req.method,
      headers,
    });
    const handled = handleAgentRequest(request);
    if (handled) {
      res.statusCode = handled.status;
      handled.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(Buffer.from(await handled.arrayBuffer()));
      return;
    }

    const url = new URL(req.url, 'https://plan-maestro.com');
    if (url.pathname === '/api/v1/health') return health(req, res);
    if (url.pathname === '/api/v1/site') return site(req, res);

    const filePath = resolveStatic(url.pathname);
    if (!filePath) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<!doctype html><title>Not found</title>');
      return;
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.setHeader('Vary', 'Accept');
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeFor(filePath));
    res.end(fs.readFileSync(filePath));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

async function fetchPath(port, pathname, accept) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    headers: accept ? { accept } : {},
    redirect: 'manual',
  });
  const text = await response.text();
  return { response, text };
}

describe('public agent endpoints', () => {
  let server;
  let port;

  before(async () => {
    ({ server, port } = await startServer());
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('negotiates markdown and html on the homepage', async () => {
    const markdown = await fetchPath(port, '/', 'text/markdown');
    assert.equal(markdown.response.status, 200);
    assert.equal(markdown.response.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.match(markdown.response.headers.get('vary'), /\bAccept\b/);
    assert.match(markdown.text, /^---/);
    assert.doesNotMatch(markdown.text, /<html/i);

    const html = await fetchPath(port, '/', 'text/html');
    assert.equal(html.response.status, 200);
    assert.match(html.response.headers.get('content-type'), /^text\/html/);
    assert.match(html.response.headers.get('vary'), /\bAccept\b/);
    assert.match(html.text, /<html/i);
    assert.match(html.text, /rel="service-desc"/);
    assert.match(html.text, /href="developers\.html"/);
  });

  it('returns markdown on a missing path and html when Accept is text/html', async () => {
    const markdown = await fetchPath(port, '/some-path-that-does-not-exist', 'text/markdown');
    assert.equal(markdown.response.status, 404);
    assert.equal(markdown.response.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.match(markdown.response.headers.get('vary'), /\bAccept\b/);
    assert.ok(markdown.text.length >= 20);
    assert.match(markdown.text, /https:\/\/plan-maestro\.com\/llms\.txt/);

    const html = await fetchPath(port, '/some-path-that-does-not-exist', 'text/html');
    assert.equal(html.response.status, 404);
    assert.match(html.response.headers.get('content-type'), /^text\/html/);
  });

  it('serves health, site, and structured API errors', async () => {
    const healthResponse = await fetchPath(port, '/api/v1/health');
    assert.equal(healthResponse.response.status, 200);
    assert.match(healthResponse.response.headers.get('content-type'), /^application\/json/);
    assert.deepEqual(JSON.parse(healthResponse.text), { status: 'ok', service: 'plan-maestro' });

    const siteResponse = await fetchPath(port, '/api/v1/site');
    const siteBody = JSON.parse(siteResponse.text);
    assert.equal(siteResponse.response.status, 200);
    assert.equal(siteBody.name, 'Plan Maestro');
    assert.equal(siteBody.openapi, 'https://plan-maestro.com/openapi.json');

    const denied = await fetch(`http://127.0.0.1:${port}/api/v1/health`, { method: 'POST' });
    assert.equal(denied.status, 405);
    assert.equal(denied.headers.get('allow'), 'GET');
    assert.match(denied.headers.get('content-type'), /^application\/problem\+json/);
    const deniedBody = await denied.json();
    assert.equal(deniedBody.code, 'method_not_allowed');
    assert.equal(deniedBody.status, 405);
    assert.match(deniedBody.hint, /openapi\.json/);

    const missing = await fetchPath(port, '/api/unknown-resource');
    assert.equal(missing.response.status, 404);
    assert.match(missing.response.headers.get('content-type'), /^application\/problem\+json/);
    const missingBody = JSON.parse(missing.text);
    assert.equal(missingBody.code, 'not_found');
    assert.match(missingBody.detail, /No API resource/);
    assert.match(missingBody.hint, /openapi\.json/);
  });

  it('publishes openapi, the api catalog, llms.txt, and the developer page', async () => {
    const spec = await fetchPath(port, '/openapi.json');
    assert.equal(spec.response.status, 200);
    assert.match(spec.response.headers.get('content-type'), /^application\/json/);
    const openapi = JSON.parse(spec.text);
    assert.equal(openapi.openapi, '3.1.0');
    assert.deepEqual(openapi.security, []);
    assert.equal(openapi.paths['/api/v1/health'].get.operationId, 'getHealth');
    assert.equal(openapi.paths['/api/v1/site'].get.operationId, 'getSite');
    assert.ok(openapi.components.schemas.Problem.required.includes('hint'));
    assert.equal(
      openapi.paths['/api/v1/health'].get.responses['405'].$ref,
      '#/components/responses/MethodNotAllowed',
    );
    const methodNotAllowed = openapi.components.responses.MethodNotAllowed;
    assert.equal(
      methodNotAllowed.content['application/problem+json'].schema.$ref,
      '#/components/schemas/Problem',
    );

    const catalog = await fetchPath(port, '/.well-known/api-catalog');
    assert.equal(catalog.response.status, 200);
    assert.match(catalog.response.headers.get('content-type'), /^application\/linkset\+json/);
    const linkset = JSON.parse(catalog.text);
    const entry = linkset.linkset[0];
    assert.equal(entry.anchor, 'https://plan-maestro.com/');
    assert.equal(entry['service-desc'][0].href, 'https://plan-maestro.com/openapi.json');
    assert.equal(entry['service-doc'][0].href, 'https://plan-maestro.com/developers');

    const llms = await fetchPath(port, '/llms.txt');
    assert.equal(llms.response.status, 200);
    assert.match(llms.text, /^# Plan Maestro/);
    assert.match(llms.text, /\[Plan Maestro developer resources\]\(https:\/\/plan-maestro\.com\/developers\)/);
    assert.match(llms.text, /https:\/\/plan-maestro\.com\/openapi\.json/);
    assert.match(llms.text, /https:\/\/plan-maestro\.com\/\.well-known\/api-catalog/);

    const sitemap = await fetchPath(port, '/sitemap.xml');
    assert.equal(sitemap.response.status, 200);
    assert.match(sitemap.text, /https:\/\/plan-maestro\.com\/developers/);
    assert.match(sitemap.text, /https:\/\/plan-maestro\.com\/openapi\.json/);

    const developers = await fetchPath(port, '/developers');
    assert.equal(developers.response.status, 200);
    assert.match(developers.text, /<title>Plan Maestro developer resources<\/title>/);
    assert.match(developers.text, /<h1>Plan Maestro developer resources<\/h1>/);
    assert.match(developers.text, /openapi\.json/);
    assert.match(developers.text, /api-catalog/);
    assert.match(developers.text, /llms\.txt/);
    assert.match(developers.text, /sitemap\.xml/);
    assert.match(developers.text, /problem\+json/);
    assert.match(developers.text, /prime\.plan-maestro\.com/);
  });
});
