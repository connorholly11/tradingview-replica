import { ChartData } from './apiService';
import { UTCTimestamp } from 'lightweight-charts';
import crypto from 'crypto';

// Define Coinbase API endpoints
const COINBASE_REST_API = 'https://api.exchange.coinbase.com';

/**
 * Interface for Coinbase historical data response
 */
interface CoinbaseCandle {
  time: number;      // Unix timestamp in seconds
  low: number;       // Lowest price during the period
  high: number;      // Highest price during the period
  open: number;      // Opening price
  close: number;     // Closing price
  volume: number;    // Volume of trading activity
}

/**
 * Sign a request for Coinbase API authentication
 */
function signRequest(
  method: string,
  requestPath: string,
  body: string = ''
): { 
  'CB-ACCESS-KEY': string;
  'CB-ACCESS-SIGN': string;
  'CB-ACCESS-TIMESTAMP': string;
  'CB-ACCESS-PASSPHRASE': string;
} {
  // Get credentials from environment variables
  const key = process.env.NEXT_PUBLIC_COINBASE_API_KEY || '';
  const secret = process.env.COINBASE_SECRET_KEY || '';
  const passphrase = process.env.COINBASE_PASSPHRASE || '';
  
  // Create timestamp (seconds since Unix Epoch in UTC)
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Create prehash string by concatenating timestamp, method, requestPath, and body
  const message = timestamp + method + requestPath + body;
  
  // Create HMAC SHA256 signature using the base64-decoded secret
  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'base64'));
  const signature = hmac.update(message).digest('base64');
  
  // Return headers required for authentication
  return {
    'CB-ACCESS-KEY': key,
    'CB-ACCESS-SIGN': signature,
    'CB-ACCESS-TIMESTAMP': timestamp,
    'CB-ACCESS-PASSPHRASE': passphrase
  };
}

/**
 * Fetch historical candle data from Coinbase
 */
export async function fetchCoinbaseHistoricalData(
  symbol: string,
  timeframe: string,
  from: string,
  to: string
): Promise<ChartData[]> {
  try {
    // Get granularity in seconds based on timeframe
    let granularity = 86400; // default to 1 day
    switch (timeframe) {
      case '1m':
        granularity = 60;
        break;
      case '5m':
        granularity = 300;
        break;
      case '15m':
        granularity = 900;
        break;
      case '30m':
        granularity = 1800;
        break;
      case '1h':
        granularity = 3600;
        break;
      case '4h':
        granularity = 14400;
        break;
      case '1D':
        granularity = 86400;
        break;
    }

    // Convert from/to dates to ISO strings
    const startTime = new Date(from).toISOString();
    const endTime = new Date(to).toISOString();
    
    // Use unauthenticated public endpoint for historical data
    const requestPath = `/products/${symbol}/candles`;
    const url = `${COINBASE_REST_API}${requestPath}?granularity=${granularity}&start=${startTime}&end=${endTime}`;
    
    console.log(`Fetching Coinbase data for ${symbol} from ${from} to ${to} with granularity ${granularity}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status} ${response.statusText}`);
    }
    
    // Coinbase returns an array of arrays in format:
    // [ time, low, high, open, close, volume ]
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from Coinbase API');
    }
    
    // Transform the data into ChartData format
    // Note: Coinbase returns data in reverse chronological order (newest first),
    // so we need to reverse it to get ascending order
    const chartData: ChartData[] = data.map((candle: number[]) => ({
      time: candle[0] as UTCTimestamp, // Unix timestamp
      open: candle[3],                  // Open price
      high: candle[2],                  // High price
      low: candle[1],                   // Low price
      close: candle[4],                 // Close price
      volume: candle[5]                 // Volume
    })).reverse();
    
    return chartData;
  } catch (error) {
    console.error('Error fetching Coinbase historical data:', error);
    
    // If the API call fails, generate some mock data for testing purposes
    return generateMockData(symbol, timeframe, from, to);
  }
}

/**
 * Generate mock data as fallback when API calls fail
 */
function generateMockData(
  symbol: string,
  timeframe: string,
  from: string,
  to: string
): ChartData[] {
  console.warn(`Generating mock data for ${symbol} from ${from} to ${to}`);
  
  const mock: ChartData[] = [];
  const count = 30;
  
  // Use different base prices for different symbols
  let basePrice = 27000; // Default for BTC-USD
  if (symbol.startsWith('ETH')) {
    basePrice = 1800;
  } else if (symbol.startsWith('LTC')) {
    basePrice = 70;
  }
  
  const fromDate = new Date(from).getTime();
  const toDate = new Date(to).getTime();
  const interval = (toDate - fromDate) / count;
  
  for (let i = 0; i < count; i++) {
    const timestamp = Math.floor((fromDate + i * interval) / 1000);
    const volatility = basePrice * 0.05; // 5% volatility
    
    const open = basePrice + (Math.random() * volatility * 2 - volatility);
    const close = open + (Math.random() * volatility * 2 - volatility);
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000 + 100);
    
    mock.push({
      time: timestamp as UTCTimestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });
  }
  
  return mock;
}
