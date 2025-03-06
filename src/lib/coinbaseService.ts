// src/lib/coinbaseService.ts

import { ChartData } from './apiService';
import { UTCTimestamp } from 'lightweight-charts';
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
 * fetchCoinbaseHistoricalData
 * Grabs candle data from Coinbase, no polygon usage
 */
export async function fetchCoinbaseHistoricalData(
  symbol: string,
  timeframe: string,
  from: string,
  to: string
): Promise<ChartData[]> {
  const granularity = mapTimeframeToGranularity(timeframe);
  const startDate = new Date(from);
  const endDate = new Date(to);

  if (startDate >= endDate) {
    console.warn('Invalid date range: from >= to');
    return [];
  }

  const totalSecs = (endDate.getTime() - startDate.getTime()) / 1000;
  const maxSpanSecs = granularity * MAX_CANDLES_PER_REQUEST;

  let allCandles: ChartData[] = [];
  let currentStart = new Date(startDate);

  while (currentStart < endDate) {
    const chunkEndMs = currentStart.getTime() + maxSpanSecs * 1000;
    const chunkEnd = chunkEndMs > endDate.getTime()
      ? endDate
      : new Date(chunkEndMs);

    const chunkData = await doSingleFetch(symbol, granularity, currentStart, chunkEnd);
    allCandles = allCandles.concat(chunkData);

    currentStart = new Date(chunkEnd.getTime() + 1000);
  }

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
    // data format: [ time, low, high, open, close, volume ]
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
    default:
      return 86400;
  }
}
