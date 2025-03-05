import { UTCTimestamp } from 'lightweight-charts';
import { getSampleData } from './sampleData';
import { fetchCoinbaseHistoricalData } from './coinbaseService';

/**
 * Polygon interfaces are commented out but kept for reference
 */
/* 
interface PolygonAggregateResult {
  c: number;
  h: number;
  l: number;
  o: number;
  t: number;
  v: number;
  vw: number;
}

interface PolygonAggregatesResponse {
  ticker: string;
  status: string;
  results: PolygonAggregateResult[];
  resultsCount: number;
  adjusted: boolean;
  queryCount: number;
  request_id: string;
  next_url?: string;
}
*/

export interface ChartData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Polygon API is deprecated - keeping the constant commented out for reference
 */
// const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API || 'v0hldwUdqQIRWo1J1_3W1nFSUppESO7N';

/**
 * Polygon fetch - commented out but kept for reference
 */
/*
export async function fetchPolygonAggregates(
  ticker: string,
  multiplier: number = 1,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day',
  from: string,
  to: string,
  adjusted: boolean = true
): Promise<{ data: ChartData[]; error?: string; warning?: string }> {
  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=${adjusted}&sort=asc&apiKey=${POLYGON_API_KEY}`;

    const response = await fetch(url);
    const data: PolygonAggregatesResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'DELAYED') {
      const sampleData = getSampleData(ticker);
      return {
        data: sampleData,
        warning: `Using sample data for ${ticker}. API returned status: ${data.status}`,
      };
    }

    if (!data.results || data.results.length === 0) {
      const sampleData = getSampleData(ticker);
      return {
        data: sampleData,
        warning: `No data available from API for ${ticker}. Using sample data.`,
      };
    }

    const chartData = data.results.map((result) => ({
      time: (result.t / 1000) as UTCTimestamp,
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v,
    }));

    return { data: chartData };
  } catch (error) {
    console.error('Error fetching data from Polygon API:', error);
    const sampleData = getSampleData(ticker);
    return {
      data: sampleData,
      warning: `Could not connect to Polygon API. Using sample data for ${ticker}.`,
    };
  }
}
*/

/**
 * Coinbase aggregator fetch
 */
export async function fetchCoinbaseAggregates(
  ticker: string,
  from: string,
  to: string,
  timeframe: string
): Promise<{ data: ChartData[]; warning?: string }> {
  try {
    // Get data from coinbaseService
    const data = await fetchCoinbaseHistoricalData(ticker, timeframe, from, to);
    return { data };
  } catch (err) {
    console.error('Error fetching data from Coinbase:', err);
    const sampleData = getSampleData(ticker);
    return {
      data: sampleData,
      warning: `Coinbase fetch failed, using sample data`,
    };
  }
}

/**
 * Return from/to for the specified number of days
 */
export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

/**
 * Convert timeframe to Coinbase granularity
 * (replacing the previous mapTimeframeToPolygonParams function)
 */
export function mapTimeframeToCoinbaseParams(
  timeframe: string
): { granularity: number } {
  // Coinbase granularity is in seconds
  switch (timeframe) {
    case '1m':
      return { granularity: 60 };
    case '5m':
      return { granularity: 300 };
    case '15m':
      return { granularity: 900 };
    case '30m':
      return { granularity: 1800 };
    case '1h':
      return { granularity: 3600 };
    case '4h':
      return { granularity: 14400 };
    case '1D':
    default:
      return { granularity: 86400 }; // 24 hours
  }
}

/**
 * Deprecated Polygon params mapping - kept for reference
 */
/*
export function mapTimeframeToPolygonParams(
  timeframe: string
): { multiplier: number; timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' } {
  switch (timeframe) {
    case '1m':
      return { multiplier: 1, timespan: 'minute' };
    case '5m':
      return { multiplier: 5, timespan: 'minute' };
    case '15m':
      return { multiplier: 15, timespan: 'minute' };
    case '30m':
      return { multiplier: 30, timespan: 'minute' };
    case '1h':
      return { multiplier: 1, timespan: 'hour' };
    case '4h':
      return { multiplier: 4, timespan: 'hour' };
    case '1D':
    default:
      return { multiplier: 1, timespan: 'day' };
  }
}
*/

/**
 * Return appropriate date range based on timeframe
 */
export function getTimeframeDateRange(timeframe: string): { from: string; to: string } {
  const to = new Date();
  const from = new Date();

  switch (timeframe) {
    case '1m':
    case '5m':
      from.setHours(from.getHours() - 24);
      break;
    case '15m':
    case '30m':
      from.setDate(from.getDate() - 7);
      break;
    case '1h':
      from.setDate(from.getDate() - 30);
      break;
    case '4h':
      from.setDate(from.getDate() - 60);
      break;
    case '1D':
      from.setDate(from.getDate() - 365);
      break;
    default:
      from.setDate(from.getDate() - 365);
      break;
  }

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

/**
 * Unified aggregator that uses Coinbase as the default provider
 */
export async function fetchAggregatesUnified(
  ticker: string,
  timeframe: string
): Promise<{ data: ChartData[]; warning?: string }> {
  const { from, to } = getTimeframeDateRange(timeframe);

  // Always use Coinbase
  return fetchCoinbaseAggregates(ticker, from, to, timeframe);
  
  /* Old Polygon code
  if (provider === 'coinbase') {
    return fetchCoinbaseAggregates(ticker, from, to, timeframe);
  } else {
    // default polygon
    const { multiplier, timespan } = mapTimeframeToPolygonParams(timeframe);
    const result = await fetchPolygonAggregates(ticker, multiplier, timespan, from, to, true);
    return {
      data: result.data,
      warning: result.warning,
    };
  }
  */
}
