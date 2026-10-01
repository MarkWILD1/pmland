'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { prefersMarkdown } = require('../lib/accept');

const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

describe('Accept negotiation', () => {
  it('serves markdown for Accept: text/markdown', () => {
    assert.equal(prefersMarkdown('text/markdown'), true);
  });

  it('serves html for Accept: text/html', () => {
    assert.equal(prefersMarkdown('text/html'), false);
  });

  it('prefers markdown when it outranks html', () => {
    assert.equal(prefersMarkdown('text/markdown, text/html;q=0.8'), true);
  });

  it('prefers html when markdown is downranked', () => {
    assert.equal(prefersMarkdown('text/html, text/markdown;q=0.1'), false);
  });

  it('keeps html for a browser Accept list and for */*', () => {
    assert.equal(prefersMarkdown(BROWSER_ACCEPT), false);
    assert.equal(prefersMarkdown('*/*'), false);
    assert.equal(prefersMarkdown(''), false);
    assert.equal(prefersMarkdown(null), false);
  });

  it('uses client order when q and specificity tie', () => {
    assert.equal(prefersMarkdown('text/markdown, text/html'), true);
    assert.equal(prefersMarkdown('text/html, text/markdown'), false);
  });

  it('ignores an explicit q=0 rejection', () => {
    assert.equal(prefersMarkdown('text/markdown;q=0, text/html'), false);
  });
});
