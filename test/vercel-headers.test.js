'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('vercel headers', () => {
  it('sets Vary Accept on the homepage and machine-readable content types', () => {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
    const headersFor = (source) => {
      const rule = config.headers.find((item) => item.source === source);
      assert.ok(rule, source);
      return Object.fromEntries(rule.headers.map((header) => [header.key, header.value]));
    };

    assert.equal(headersFor('/')['Vary'], 'Accept');
    assert.equal(headersFor('/index.html')['Vary'], 'Accept');
    assert.equal(headersFor('/openapi.json')['Content-Type'], 'application/json');
    assert.equal(headersFor('/.well-known/api-catalog')['Content-Type'], 'application/linkset+json');
  });
});
