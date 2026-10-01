'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { handleAgentRequest } = require('../lib/routes');
const {
  KNOWN_PAGES,
  MARKDOWN_CONTENT_TYPE,
  homepageMarkdown,
  htmlRelToCleanPath,
  notFoundMarkdown,
} = require('../lib/content');
const { PROBLEM_CONTENT_TYPE } = require('../lib/problem');

const ROOT = path.join(__dirname, '..');

function request(pathname, { accept, method } = {}) {
  return new Request(`https://plan-maestro.com${pathname}`, {
    method: method || 'GET',
    headers: accept ? { accept } : {},
  });
}

function walkHtml(dir, prefix = '') {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walkHtml(full, rel));
    else if (entry.name.endsWith('.html')) found.push(rel.split('\\').join('/'));
  }
  return found;
}

describe('agent routes', () => {
  it('returns homepage markdown when Accept prefers text/markdown', async () => {
    const response = handleAgentRequest(request('/', { accept: 'text/markdown' }));
    assert.ok(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), MARKDOWN_CONTENT_TYPE);
    assert.match(response.headers.get('vary'), /\bAccept\b/);
    const body = await response.text();
    assert.ok(body.length > 20);
    assert.match(body, /Plan Maestro/);
    assert.match(body, /https:\/\/plan-maestro\.com\/llms\.txt/);
    assert.equal(body, homepageMarkdown());
  });

  it('leaves the homepage HTML response to static hosting', () => {
    assert.equal(handleAgentRequest(request('/', { accept: 'text/html' })), null);
    assert.equal(handleAgentRequest(request('/', {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    })), null);
  });

  it('returns a markdown 404 for an unknown path', async () => {
    const response = handleAgentRequest(request('/__ora-404-probe-6jj4j5lg', { accept: 'text/markdown' }));
    assert.ok(response);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('content-type'), MARKDOWN_CONTENT_TYPE);
    assert.match(response.headers.get('vary'), /\bAccept\b/);
    const body = await response.text();
    assert.ok(body.length >= 20);
    assert.match(body, /does not exist/);
    assert.match(body, /https:\/\/plan-maestro\.com\/llms\.txt/);
    assert.match(body, /https:\/\/plan-maestro\.com\/sitemap\.xml/);
    assert.match(body, /https:\/\/plan-maestro\.com\/developers/);
    assert.equal(body, notFoundMarkdown('/__ora-404-probe-6jj4j5lg'));
  });

  it('does not invent a markdown 404 for html clients or known pages', () => {
    assert.equal(handleAgentRequest(request('/missing-page', { accept: 'text/html' })), null);
    assert.equal(handleAgentRequest(request('/documentation', { accept: 'text/markdown' })), null);
    assert.equal(handleAgentRequest(request('/assets/images/icon.png', { accept: 'text/markdown' })), null);
    assert.equal(handleAgentRequest(request('/.well-known/api-catalog', { accept: 'text/markdown' })), null);
  });

  it('returns problem+json for an unknown API path and passes known API routes through', async () => {
    const missing = handleAgentRequest(request('/api/does-not-exist', { accept: 'text/markdown' }));
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('content-type'), PROBLEM_CONTENT_TYPE);
    const body = JSON.parse(await missing.text());
    assert.equal(body.status, 404);
    assert.equal(body.code, 'not_found');
    assert.equal(body.title, 'Not Found');
    assert.match(body.detail, /No API resource/);
    assert.equal(body.instance, '/api/does-not-exist');
    assert.match(body.hint, /https:\/\/plan-maestro\.com\/openapi\.json/);
    assert.match(body.type, /^https:\/\/plan-maestro\.com\/developers#not_found$/);

    assert.equal(handleAgentRequest(request('/api/v1/health')), null);
    assert.equal(handleAgentRequest(request('/api/v1/site', { method: 'POST' })), null);
    assert.equal(handleAgentRequest(request('/api/meta-conversions', { method: 'POST' })), null);
  });

  it('lists every shipped html page', () => {
    const htmlFiles = walkHtml(ROOT);
    assert.ok(htmlFiles.includes('developers.html'));
    for (const rel of htmlFiles) {
      const clean = htmlRelToCleanPath(rel);
      assert.equal(KNOWN_PAGES.has(clean), true, `${rel} -> ${clean}`);
    }
  });
});
