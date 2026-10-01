'use strict';

const { PROBLEM_CONTENT_TYPE, problem } = require('./problem');

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

function send(res, status, body, headers) {
  res.statusCode = status;
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.end(JSON.stringify(body));
}

function sendProblem(res, fields) {
  const body = problem(fields);
  const headers = {
    'Content-Type': PROBLEM_CONTENT_TYPE,
    'Cache-Control': 'no-store',
  };
  if (body.status === 405) headers.Allow = 'GET';
  send(res, body.status, body, headers);
}

function sendJson(res, body) {
  send(res, 200, body, {
    'Content-Type': JSON_CONTENT_TYPE,
    'Cache-Control': 'public, max-age=60',
  });
}

function rejectUnlessGet(req, res, instance) {
  if (String(req.method || 'GET').toUpperCase() === 'GET') return false;
  sendProblem(res, {
    status: 405,
    code: 'method_not_allowed',
    title: 'Method Not Allowed',
    detail: 'This endpoint only accepts GET.',
    instance,
  });
  return true;
}

module.exports = {
  JSON_CONTENT_TYPE,
  sendProblem,
  sendJson,
  rejectUnlessGet,
};
