/**
 * Add TextEncoder and TextDecoder to the global object
 * These are needed for MSW but not available in Jest's jsdom environment
 */

const { TextEncoder, TextDecoder } = require('util');

Object.defineProperties(global, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
});

// Add fetch polyfill
const { fetch, Headers, Request, Response } = require('node-fetch');

Object.defineProperties(global, {
  fetch: { value: fetch, writable: true },
  Headers: { value: Headers, writable: true },
  Request: { value: Request, writable: true },
  Response: { value: Response, writable: true },
}); 