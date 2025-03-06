import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define the Coinbase response type for candles
// Data is an array of [ timestamp, low, high, open, close, volume ]
type CoinbaseCandleData = [number, number, number, number, number, number];

// Sample BTC-USD data for testing
const sampleBTCData: CoinbaseCandleData[] = [
  // time, low, high, open, close, volume
  [1679913600, 27100.25, 27890.45, 27150.11, 27822.64, 1250.5],
  [1680000000, 27750.67, 28102.89, 27822.64, 28050.33, 1876.2],
  [1680086400, 27950.33, 28550.21, 28050.33, 28249.87, 2100.8],
];

// Sample ETH-USD data for testing
const sampleETHData: CoinbaseCandleData[] = [
  // time, low, high, open, close, volume
  [1679913600, 1790.25, 1820.45, 1795.11, 1810.64, 8250.5],
  [1680000000, 1805.67, 1835.89, 1810.64, 1820.33, 9876.2],
  [1680086400, 1815.33, 1870.21, 1820.33, 1865.87, 12100.8],
];

// Sample data for different crypto pairs
const cryptoData: Record<string, CoinbaseCandleData[]> = {
  'BTC-USD': sampleBTCData,
  'ETH-USD': sampleETHData,
  'SOL-USD': sampleBTCData.map(candle => 
    [candle[0], candle[1] / 100, candle[2] / 100, candle[3] / 100, candle[4] / 100, candle[5] * 2]
  ),
  'AVAX-USD': sampleETHData.map(candle => 
    [candle[0], candle[1] / 10, candle[2] / 10, candle[3] / 10, candle[4] / 10, candle[5] * 1.5]
  ),
};

// Define the request handlers
export const handlers = [
  // Mock Coinbase Candles API
  http.get('https://api.exchange.coinbase.com/products/:symbol/candles', ({ params, request }) => {
    const symbol = params.symbol as string;
    
    // Parse query parameters
    const url = new URL(request.url);
    const granularity = url.searchParams.get('granularity') || '86400';
    
    // Return data for the requested symbol or empty array
    const data = cryptoData[symbol] || [];
    
    // If data is empty, return a 404
    if (data.length === 0) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(data);
  }),
];

// Set up MSW server
export const server = setupServer(...handlers); 