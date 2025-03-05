import { UTCTimestamp } from 'lightweight-charts';
import { getSampleData } from './sampleData';

/**
 * Polygon API key from environment variables
 * @constant
 */
const POLYGON_API_KEY = 'v0hldwUdqQIRWo1J1_3W1nFSUppESO7N';

/**
 * Interface for raw data returned from Polygon API
 * @interface PolygonAggregateResult
 */
interface PolygonAggregateResult {
  c: number; // close
  h: number; // high
  l: number; // low
  o: number; // open
  t: number; // timestamp (Unix ms)
  v: number; // volume
  vw: number; // volume weighted average price
}

/**
 * Interface for the complete Polygon API response
 * @interface PolygonAggregatesResponse
 */
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

/**
 * Interface for the standardized chart data format used throughout the application
 * @interface ChartData
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
 * Fetches stock/ticker aggregated data from Polygon API
 * Falls back to sample data when API returns an error or no data
 * 
 * @param ticker - The stock ticker symbol (e.g., 'AAPL')
 * @param multiplier - The size of the timespan multiplier
 * @param timespan - The size of the time window (minute, hour, day, etc.)
 * @param from - The start date in format 'YYYY-MM-DD'
 * @param to - The end date in format 'YYYY-MM-DD'
 * @param adjusted - Whether to use adjusted stock data
 * @returns An object containing the chart data array and optional error message or warning
 */
export async function fetchPolygonAggregates(
  ticker: string,
  multiplier: number = 1,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' = 'day',
  from: string,
  to: string,
  adjusted: boolean = true
): Promise<{ data: ChartData[], error?: string, warning?: string }> {
  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=${adjusted}&sort=asc&apiKey=${POLYGON_API_KEY}`;
    
    const response = await fetch(url);
    const data: PolygonAggregatesResponse = await response.json();
    
    // Accept OK, DELAYED, or ERROR (with fallback) statuses
    if (data.status !== 'OK' && data.status !== 'DELAYED') {
      // If ERROR status or any other error, use sample data as fallback
      const sampleData = getSampleData(ticker);
      return { 
        data: sampleData, 
        warning: `Using sample data for ${ticker}. API returned status: ${data.status}` 
      };
    }
    
    // Check if results exist and are not empty
    if (!data.results || data.results.length === 0) {
      // Fall back to sample data when no results
      const sampleData = getSampleData(ticker);
      return { 
        data: sampleData, 
        warning: `No data available from API for ${ticker}. Using sample data.` 
      };
    }
    
    // Transform the data to the format expected by our chart component
    const chartData = data.results.map(result => ({
      time: (result.t / 1000) as UTCTimestamp, // Convert ms to seconds for lightweight-charts
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v
    }));
    
    return { data: chartData };
  } catch (error) {
    console.error('Error fetching data from Polygon API:', error);
    
    // Use sample data as fallback when API fails
    const sampleData = getSampleData(ticker);
    return { 
      data: sampleData, 
      warning: `Could not connect to Polygon API. Using sample data for ${ticker}.` 
    };
  }
}

/**
 * Get a date range for the specified number of days ago until today
 * 
 * @param days - Number of days to look back
 * @returns Object containing from and to dates in 'YYYY-MM-DD' format
 */
export function getDateRange(days: number): { from: string, to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  };
}

/**
 * Maps UI timeframe selection to Polygon API parameters
 * Converts user-friendly timeframe strings to the format required by the API
 * 
 * @param timeframe - The timeframe string (e.g., '1m', '5m', '1D', etc.)
 * @returns Object containing multiplier and timespan for Polygon API
 */
export function mapTimeframeToPolygonParams(timeframe: string): { multiplier: number, timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' } {
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
      return { multiplier: 1, timespan: 'day' };
    case '1W':
      return { multiplier: 1, timespan: 'week' };
    case '1M':
      return { multiplier: 1, timespan: 'month' };
    default:
      return { multiplier: 1, timespan: 'day' };
  }
}

/**
 * Returns an appropriate date range based on the selected timeframe
 * Dynamically adjusts the range to ensure sufficient data points
 * 
 * @param timeframe - The timeframe string (e.g., '1m', '5m', '1D', etc.)
 * @returns Object containing from and to dates in 'YYYY-MM-DD' format
 */
export function getTimeframeDateRange(timeframe: string): { from: string, to: string } {
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
    case '1W':
      from.setDate(from.getDate() - 365 * 2);
      break;
    case '1M':
      from.setDate(from.getDate() - 365 * 5);
      break;
    default:
      from.setDate(from.getDate() - 365);
      break;
  }
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  };
}

/**
 * A list of popular stock symbols to use in the symbol search component
 * @constant
 */
export const popularSymbols = [
  'AAPL',  // Apple
  'MSFT',  // Microsoft
  'AMZN',  // Amazon
  'GOOGL', // Alphabet (Google)
  'META',  // Meta (Facebook)
  'TSLA',  // Tesla
  'NVDA',  // NVIDIA
  'BRK.B', // Berkshire Hathaway
  'JPM',   // JPMorgan Chase
  'JNJ',   // Johnson & Johnson
  'V',     // Visa
  'PG',    // Procter & Gamble
  'UNH',   // UnitedHealth Group
  'HD',    // Home Depot
  'BAC',   // Bank of America
  'XOM',   // Exxon Mobil
  'PFE',   // Pfizer
  'INTC',  // Intel
  'CMCSA', // Comcast
  'KO',    // Coca-Cola
  'VZ',    // Verizon
  'T',     // AT&T
  'DIS',   // Disney
  'NFLX',  // Netflix
  'ADBE',  // Adobe
  'CSCO',  // Cisco
  'PEP',   // PepsiCo
  'WMT',   // Walmart
  'CRM',   // Salesforce
  'ABT'    // Abbott Laboratories
]; 