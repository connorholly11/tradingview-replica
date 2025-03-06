/**
 * fetchWithRetry.ts
 *
 * A small helper to retry fetch requests a specified number of times.
 * This can optionally include a delay or exponential backoff.
 */

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delayMs = 500
): Promise<Response> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      
      // Return the response even if it's not OK (404, etc.)
      // Let the calling code decide how to handle non-200 responses
      return response;
      
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt < retries) {
        // Optional: simple delay; could also do exponential backoff
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
} 