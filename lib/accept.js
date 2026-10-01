'use strict';

/**
 * RFC 9110 Accept parsing. Picks text/markdown only when it outranks text/html.
 * A missing header, a star slash star range, or a typical browser Accept list keeps HTML.
 */

function parseAccept(header) {
  if (!header || !String(header).trim()) return [];

  return String(header).split(',').map((part, index) => {
    const bits = part.trim().split(';').map((piece) => piece.trim()).filter(Boolean);
    const media = (bits[0] || '').toLowerCase();
    const slash = media.indexOf('/');
    if (slash <= 0) return null;

    let q = 1;
    const params = {};
    for (const bit of bits.slice(1)) {
      const eq = bit.indexOf('=');
      const key = (eq === -1 ? bit : bit.slice(0, eq)).trim().toLowerCase();
      let value = eq === -1 ? '' : bit.slice(eq + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (key === 'q') {
        const parsed = Number(value);
        q = Number.isFinite(parsed) ? parsed : 0;
      } else if (key) {
        params[key] = value.toLowerCase();
      }
    }

    if (!(q > 0)) return null;

    return {
      type: media.slice(0, slash),
      subtype: media.slice(slash + 1),
      q,
      params,
      index,
    };
  }).filter(Boolean);
}

function matchRange(range, mediaType) {
  const slash = mediaType.indexOf('/');
  const type = mediaType.slice(0, slash);
  const subtype = mediaType.slice(slash + 1);
  if (range.type !== '*' && range.type !== type) return null;
  if (range.subtype !== '*' && range.subtype !== subtype) return null;

  let specificity = 0;
  if (range.type !== '*') specificity += 1;
  if (range.subtype !== '*') specificity += 1;
  specificity += Object.keys(range.params).length;

  return { q: range.q, specificity, index: range.index };
}

function bestMatch(ranges, mediaType) {
  let best = null;
  for (const range of ranges) {
    const match = matchRange(range, mediaType);
    if (!match) continue;
    if (
      !best
      || match.q > best.q
      || (match.q === best.q && match.specificity > best.specificity)
      || (match.q === best.q && match.specificity === best.specificity && match.index < best.index)
    ) {
      best = match;
    }
  }
  return best;
}

function prefersMarkdown(acceptHeader) {
  const ranges = parseAccept(acceptHeader);
  const markdown = bestMatch(ranges, 'text/markdown');
  if (!markdown) return false;

  const html = bestMatch(ranges, 'text/html');
  if (!html) return true;
  if (markdown.q !== html.q) return markdown.q > html.q;
  if (markdown.specificity !== html.specificity) return markdown.specificity > html.specificity;
  return markdown.index < html.index;
}

module.exports = {
  parseAccept,
  prefersMarkdown,
};
