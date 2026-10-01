'use strict';

const { prefersMarkdown } = require('./accept');
const {
  KNOWN_API,
  KNOWN_PAGES,
  MARKDOWN_CONTENT_TYPE,
  homepageMarkdown,
  notFoundMarkdown,
} = require('./content');
const { ORIGIN, PROBLEM_CONTENT_TYPE, problem } = require('./problem');

function normalizePath(pathname) {
  let path = pathname || '/';
  try {
    path = decodeURIComponent(path);
  } catch (error) {
    path = pathname || '/';
  }
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  if (!path.startsWith('/')) path = `/${path}`;
  return path;
}

function hasFileExtension(pathname) {
  const segment = pathname.split('/').pop() || '';
  return segment.includes('.');
}

function markdownResponse(body, status) {
  const headers = {
    'Content-Type': MARKDOWN_CONTENT_TYPE,
    'Vary': 'Accept',
    'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-store',
  };
  if (status === 200) {
    headers.Link = `<${ORIGIN}/>; rel="canonical"`;
  } else {
    headers['X-Robots-Tag'] = 'noindex';
  }
  return new Response(body, { status, headers });
}

function problemResponse(fields) {
  const body = problem(fields);
  return new Response(JSON.stringify(body), {
    status: body.status,
    headers: {
      'Content-Type': PROBLEM_CONTENT_TYPE,
      'Cache-Control': 'no-store',
    },
  });
}

function handleAgentRequest(request) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);
  const method = String(request.method || 'GET').toUpperCase();

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    if (!KNOWN_API.has(pathname)) {
      return problemResponse({
        status: 404,
        code: 'not_found',
        title: 'Not Found',
        detail: 'No API resource exists at this path.',
        instance: pathname,
      });
    }
    return null;
  }

  if (pathname.startsWith('/.well-known/')) return null;
  if (hasFileExtension(pathname)) return null;
  if (method !== 'GET') return null;
  if (!prefersMarkdown(request.headers.get('accept'))) return null;
  if (pathname === '/') return markdownResponse(homepageMarkdown(), 200);
  if (KNOWN_PAGES.has(pathname)) return null;

  return markdownResponse(notFoundMarkdown(pathname), 404);
}

module.exports = {
  normalizePath,
  handleAgentRequest,
};
