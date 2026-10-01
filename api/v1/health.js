'use strict';

const { sendJson, rejectUnlessGet } = require('../../lib/http');

module.exports = function health(req, res) {
  if (rejectUnlessGet(req, res, '/api/v1/health')) return;
  sendJson(res, {
    status: 'ok',
    service: 'plan-maestro',
  });
};
