import { ChartData } from './apiService';
import { UTCTimestamp } from 'lightweight-charts';

/**
 * fetchCoinbaseHistoricalData
 * Minimal or mock approach for BTC-USD historical data
 */

export async function fetchCoinbaseHistoricalData(
  symbol: string,
  timeframe: string,
  from: string,
  to: string
): Promise<ChartData[]> {
  // For demonstration, we do a mock approach or partial
  // because Coinbase advanced trade might not provide simple OHLC
  // We'll create some mock data or minimal data
  const mock: ChartData[] = [];

  // Generate some random data between from/to for the timeframe
  // We'll do ~30 data points
  const count = 30;
  const basePrice = 27000; // pretend BTC price
  for (let i = 0; i < count; i++) {
    const open = basePrice + Math.random() * 200 - 100;
    const close = open + (Math.random() * 100 - 50);
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;

    // Fake time stepping
    const time = Math.floor(Date.now() / 1000) - (count - i) * 3600;

    mock.push({
      time: time as UTCTimestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000)
    });
  }

  return Promise.resolve(mock);
}
