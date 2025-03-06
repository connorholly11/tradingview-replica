// src/lib/coinbaseService.ts

import { ChartData } from './apiService';
import { UTCTimestamp } from 'lightweight-charts';
import { generateSampleData } from './sampleData';
import { fetchWithRetry } from './fetchWithRetry';

/**
 * Public Coinbase REST API base for candlesticks
 */
const COINBASE_REST_API = 'https://api.exchange.coinbase.com';

/**
 * Maximum data points per Coinbase request = 300
 * We'll chunk requests accordingly.
 */
const MAX_CANDLES_PER_REQUEST = 300;

/**
 * If you needed private endpoints you'd sign requests,
 * but for public /products/:symbol/candles, no auth is required.
 * We'll comment out signRequest to avoid confusion:

// function signRequest(...) { ... } // Not used for public data
 */

/**
 * Calculate max time range in seconds based on granularity to stay within 300 data points
 */
function calculateMaxTimeRange(granularitySeconds: number): number {
  const MAX_DATA_POINTS = 300;
  return granularitySeconds * MAX_DATA_POINTS;
}

/**
 * fetchCoinbaseHistoricalData
 *
 * Fetches historical candlestick data from Coinbase, automatically chunking
 * requests if the date range is too large for a single 300-candle call.
 *
 * @param symbol  e.g. "BTC-USD"
 * @param timeframe e.g. "1m", "1h", "1D"
 * @param from ISO date string for start time
 * @param to   ISO date string for end time
 * @returns    Array of ChartData objects
 */
export async function fetchCoinbaseHistoricalData(
  symbol: string,
  timeframe: string,
  from: string,
  to: string
): Promise<ChartData[]> {
  // For symbols that don't match the pattern *-USD, fallback to mock data:
  if (!symbol.includes('-USD')) {
    console.warn(
      `Coinbase does not support '${symbol}' for candle data. Using sample data fallback.`
    );
    return generateSampleData(100, 30000, 600);
  }

  // Convert timeframe -> coinbase granularity in seconds
  const granularity = mapTimeframeToGranularity(timeframe);

  // Convert from/to into Date objects
  const startDate = new Date(from);
  const endDate = new Date(to);
  if (startDate >= endDate) {
    console.warn(`Invalid date range: from >= to`);
    return [];
  }

  // Check if date range is bigger than we can fetch in a single request
  const totalSecs = (endDate.getTime() - startDate.getTime()) / 1000;
  const maxSpanSecs = granularity * MAX_CANDLES_PER_REQUEST;

  if (totalSecs <= maxSpanSecs) {
    // Single chunk is sufficient
    const singleChunk = await doSingleFetch(symbol, granularity, startDate, endDate);
    return singleChunk;
  }

  // Otherwise, chunk the date range
  let allCandles: ChartData[] = [];
  let currentStart = new Date(startDate);

  while (currentStart < endDate) {
    const chunkEndMs = currentStart.getTime() + maxSpanSecs * 1000;
    const chunkEnd = chunkEndMs > endDate.getTime()
      ? endDate
      : new Date(chunkEndMs);

    const chunkData = await doSingleFetch(symbol, granularity, currentStart, chunkEnd);
    allCandles = allCandles.concat(chunkData);

    // Move start forward
    currentStart = new Date(chunkEnd.getTime() + 1000); // +1s to avoid overlap
  }

  // Sort ascending by time
  allCandles.sort((a, b) => (a.time as number) - (b.time as number));

  // Deduplicate if needed
  const deduped: ChartData[] = [];
  let lastTs: number | null = null;
  for (const c of allCandles) {
    if (lastTs === null || c.time !== lastTs) {
      deduped.push(c);
      lastTs = c.time;
    }
  }

  return deduped;
}

/**
 * doSingleFetch
 *
 * Fetch a single chunk of up to 300 candles from Coinbase
 */
async function doSingleFetch(
  symbol: string,
  granularity: number,
  startDate: Date,
  endDate: Date
): Promise<ChartData[]> {
  const requestPath = `/products/${symbol}/candles`;
  const url = new URL(COINBASE_REST_API + requestPath);
  url.searchParams.set('granularity', String(granularity));
  url.searchParams.set('start', startDate.toISOString());
  url.searchParams.set('end', endDate.toISOString());

  try {
    const resp = await fetchWithRetry(url.toString(), { method: 'GET' }, 3, 500);
    const data = await resp.json();
    if (!Array.isArray(data)) {
      console.error(`Coinbase candle response invalid for symbol=${symbol}`);
      return [];
    }

    // Data is [ time, low, high, open, close, volume ]
    // Convert to ChartData. Reverse to ascending order if needed.
    // By default, coinbase returns newest-to-oldest, so we reverse to oldest first
    data.reverse();
    const candles: ChartData[] = data.map((candle: number[]) => ({
      time: candle[0] as UTCTimestamp,
      low: candle[1],
      high: candle[2],
      open: candle[3],
      close: candle[4],
      volume: candle[5],
    }));

    return candles;
  } catch (err) {
    console.error(`Error fetching chunk [${startDate} to ${endDate}] for ${symbol}`, err);
    return [];
  }
}

/**
 * mapTimeframeToGranularity
 * Converts a string timeframe to coinbase granularity in seconds.
 */
function mapTimeframeToGranularity(tf: string): number {
  switch (tf) {
    case '1m':
      return 60;
    case '5m':
      return 300;
    case '15m':
      return 900;
    case '30m':
      return 1800;
    case '1h':
      return 3600;
    case '6h':
      return 21600;
    case '1D':
    case '1d':
      return 86400;
    default:
      // default 1D if unrecognized
      return 86400;
  }
}

/**
 * Helper function to fetch a single chunk of candles
 */
async function fetchCandles(
  symbol: string,
  granularity: number,
  startTime: string,
  endTime: string
): Promise<ChartData[]> {
  const requestPath = `/products/${symbol}/candles`;
  const url = `${COINBASE_REST_API}${requestPath}?granularity=${granularity}&start=${startTime}&end=${endTime}`;

  console.log(`Fetching Coinbase data for ${symbol} from=${startTime} to=${endTime}, granularity=${granularity}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const statusText = `${response.status} ${response.statusText}`;
      console.error(`Coinbase API error: ${statusText}`);
      // Optionally read the body for more info
      const errBody = await response.text();
      console.error('Error body:', errBody);
      throw new Error(`Coinbase API error: ${statusText}`);
    }

    // Coinbase returns array-of-arrays: [ time, low, high, open, close, volume ]
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format from Coinbase (expected an array)');
    }

    const chartData: ChartData[] = data.map((candle: number[]) => ({
      time: candle[0] as UTCTimestamp, // Unix ts in seconds
      open: candle[3],
      high: candle[2],
      low: candle[1],
      close: candle[4],
      volume: candle[5],
    })).reverse();

    return chartData;
  } catch (error) {
    console.error('Error fetching Coinbase historical data:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Fallback generator if Coinbase fails or symbol not recognized
 */
function generateMockData(
  symbol: string,
  timeframe: string,
  from: string,
  to: string
): ChartData[] {
  console.warn(
    `Generating mock data for symbol=${symbol} timeframe=${timeframe}, from=${from}, to=${to}`
  );
  return generateSampleData(100, 30000, 600); // Just a sample
}
