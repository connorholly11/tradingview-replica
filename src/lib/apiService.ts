import { UTCTimestamp } from 'lightweight-charts';
import { fetchCoinbaseHistoricalData } from './coinbaseService';

/**
 * ChartData interface for candle data in our app
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
 * getDateRange
 * Utility to produce a date range for a given # of days in the past
 * (We keep this if needed by other parts of the app)
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
 * getTimeframeDateRange
 * Convert a timeframe to a start/end range for fetching data.
 * This is a simplified approach; the chunking is done in coinbaseService.
 */
export function getTimeframeDateRange(timeframe: string): { from: string; to: string } {
  const to = new Date();
  const from = new Date();

  switch (timeframe) {
    case '1m':
      // ~5 hours
      from.setHours(from.getHours() - 5);
      break;
    case '5m':
      // ~1 day
      from.setHours(from.getHours() - 24);
      break;
    case '15m':
      // ~3 days
      from.setDate(from.getDate() - 3);
      break;
    case '1h':
      // ~12 days
      from.setDate(from.getDate() - 12);
      break;
    case '6h':
      // ~75 days
      from.setDate(from.getDate() - 75);
      break;
    case '1D':
    case '1d':
    default:
      // ~300 days
      from.setDate(from.getDate() - 300);
      break;
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

/**
 * fetchAggregatesUnified
 * Calls coinbaseService for historical data, no polygon or stock references
 */
export async function fetchAggregatesUnified(
  ticker: string,
  timeframe: string
): Promise<{ data: ChartData[] }> {
  const { from, to } = getTimeframeDateRange(timeframe);
  const data = await fetchCoinbaseHistoricalData(ticker, timeframe, from, to);
  return { data };
}

/**
 * The actual coinbase fetch function is imported from coinbaseService.ts
 */
