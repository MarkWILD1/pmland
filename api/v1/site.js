'use strict';

const { ORIGIN } = require('../../lib/problem');
const { sendJson, rejectUnlessGet } = require('../../lib/http');

module.exports = function site(req, res) {
  if (rejectUnlessGet(req, res, '/api/v1/site')) return;
  sendJson(res, {
    name: 'Plan Maestro',
    url: `${ORIGIN}/`,
    appUrl: 'https://prime.plan-maestro.com',
    docsUrl: `${ORIGIN}/documentation.html`,
    developersUrl: `${ORIGIN}/developers`,
    llmsTxt: `${ORIGIN}/llms.txt`,
    openapi: `${ORIGIN}/openapi.json`,
    language: 'es-UY',
  });
};
