/**
 * Add TextEncoder and TextDecoder to the global object
 * These are needed for MSW but not available in Jest's jsdom environment
 */

import { TextEncoder, TextDecoder } from 'util';
import { fetch, Headers, Request, Response } from 'node-fetch';

Object.defineProperties(global, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
});

// Add fetch polyfill
Object.defineProperties(global, {
  fetch: { value: fetch, writable: true },
  Headers: { value: Headers, writable: true },
  Request: { value: Request, writable: true },
  Response: { value: Response, writable: true },
}); 