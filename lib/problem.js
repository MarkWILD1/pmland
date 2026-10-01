'use strict';

const ORIGIN = 'https://plan-maestro.com';
const OPENAPI_URL = `${ORIGIN}/openapi.json`;
const PROBLEM_CONTENT_TYPE = 'application/problem+json; charset=utf-8';

function problem({ status, code, title, detail, instance, hint }) {
  return {
    type: `${ORIGIN}/developers#${code}`,
    title,
    status,
    detail,
    instance,
    code,
    hint: hint || `See ${OPENAPI_URL} for the published API surface.`,
  };
}

module.exports = {
  ORIGIN,
  OPENAPI_URL,
  PROBLEM_CONTENT_TYPE,
  problem,
};
