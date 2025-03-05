import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define the polygon response type
interface PolygonAggregateResult {
  c: number; // close
  h: number; // high
  l: number; // low
  o: number; // open
  t: number; // timestamp (Unix ms)
  v: number; // volume
  vw: number; // volume weighted average price
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

// Sample stock data for testing
const sampleAAPLData: PolygonAggregatesResponse = {
  ticker: 'AAPL',
  status: 'OK',
  results: [
    {
      c: 150.23,
      h: 152.45,
      l: 149.87,
      o: 150.11,
      t: 1679913600000, // 2023-03-27
      v: 76543210,
      vw: 151.12,
    },
    {
      c: 151.75,
      h: 153.89,
      l: 150.45,
      o: 150.67,
      t: 1680000000000, // 2023-03-28
      v: 65432109,
      vw: 152.33,
    },
    {
      c: 152.33,
      h: 154.21,
      l: 151.67,
      o: 151.89,
      t: 1680086400000, // 2023-03-29
      v: 87654321,
      vw: 153.05,
    },
  ],
  resultsCount: 3,
  adjusted: true,
  queryCount: 1,
  request_id: 'mock-request-id',
};

// Sample data for different tickers
const tickerData: Record<string, PolygonAggregatesResponse> = {
  'AAPL': sampleAAPLData,
  'MSFT': {
    ...sampleAAPLData,
    ticker: 'MSFT',
    results: sampleAAPLData.results.map(item => ({...item, c: item.c * 1.2, h: item.h * 1.2, l: item.l * 1.2, o: item.o * 1.2}))
  },
  'GOOGL': {
    ...sampleAAPLData,
    ticker: 'GOOGL',
    results: sampleAAPLData.results.map(item => ({...item, c: item.c * 2.5, h: item.h * 2.5, l: item.l * 2.5, o: item.o * 2.5}))
  }
};

// Define the request handlers
export const handlers = [
  // Mock Polygon Aggregates API
  http.get('https://api.polygon.io/v2/aggs/ticker/:ticker/range/:multiplier/:timespan/:from/:to', ({ params }) => {
    const ticker = params.ticker as string;
    // Return data for the requested ticker or fallback to AAPL
    return HttpResponse.json(tickerData[ticker] || sampleAAPLData);
  }),
];

// Set up MSW server
export const server = setupServer(...handlers); 