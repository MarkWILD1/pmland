import { next } from '@vercel/functions';
import routes from './lib/routes.js';

export default function middleware(request) {
  const response = routes.handleAgentRequest(request);
  if (response) return response;
  return next();
}
