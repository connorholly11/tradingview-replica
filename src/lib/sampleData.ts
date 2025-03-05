import { UTCTimestamp } from 'lightweight-charts';
import { ChartData } from './apiService';

// Generate a series of dates in the past (in UTC timestamp format)
const generateDates = (count: number): UTCTimestamp[] => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const dates: UTCTimestamp[] = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - i);
    dates.push((date.getTime() / 1000) as UTCTimestamp);
  }
  
  return dates;
};

// Generate random price data within a range
const generatePriceData = (basePrice: number, volatility: number, count: number) => {
  const prices = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility;
    currentPrice = Math.max(currentPrice + change, 0);
    
    const open = currentPrice;
    const close = open * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    prices.push({
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
  }
  
  return prices;
};

// Generate volume data
const generateVolumeData = (count: number, baseVolume: number) => {
  const volumes = [];
  
  for (let i = 0; i < count; i++) {
    const volume = baseVolume * (0.5 + Math.random());
    volumes.push(parseFloat(volume.toFixed(2)));
  }
  
  return volumes;
};

// Combine all data
export const generateSampleData = (count = 100, basePrice = 40000, volatility = 400) => {
  const dates = generateDates(count);
  const priceData = generatePriceData(basePrice, volatility, count);
  const volumeData = generateVolumeData(count, 1000);
  
  return dates.map((time, index) => ({
    time,
    ...priceData[index],
    volume: volumeData[index]
  }));
};

export const getBtcUsdData = () => {
  return generateSampleData(100, 48000, 500);
};

export const getEthUsdData = () => {
  return generateSampleData(100, 3200, 100);
};

export const getSolUsdData = () => {
  return generateSampleData(100, 120, 5);
};

export const getDogeUsdData = () => {
  return generateSampleData(100, 0.12, 0.01);
};

/**
 * Get appropriate sample data for a given ticker symbol
 * This serves as fallback when the API fails or returns no data
 * 
 * @param ticker - The stock ticker symbol
 * @returns Sample chart data matching the ticker's typical price range
 */
export const getSampleData = (ticker: string): ChartData[] => {
  // Map common stock tickers to reasonable price ranges
  switch(ticker.toUpperCase()) {
    case 'AAPL':
      return generateSampleData(100, 180, 2); // Apple ~$180
    case 'MSFT':
      return generateSampleData(100, 350, 3); // Microsoft ~$350
    case 'GOOGL':
    case 'GOOG':
      return generateSampleData(100, 135, 1.5); // Alphabet ~$135
    case 'AMZN':
      return generateSampleData(100, 170, 2); // Amazon ~$170
    case 'META':
      return generateSampleData(100, 440, 5); // Meta ~$440
    case 'TSLA':
      return generateSampleData(100, 180, 4); // Tesla ~$180
    case 'NVDA':
      return generateSampleData(100, 800, 15); // NVIDIA ~$800
    case 'JPM':
      return generateSampleData(100, 190, 2); // JPMorgan ~$190
    case 'V':
      return generateSampleData(100, 270, 2.5); // Visa ~$270
    case 'BRK.A':
    case 'BRK.B':
      return generateSampleData(100, 400, 3); // Berkshire Hathaway ~$400 (B class)
    case 'JNJ':
      return generateSampleData(100, 150, 1.5); // Johnson & Johnson ~$150
    case 'WMT':
      return generateSampleData(100, 60, 0.5); // Walmart ~$60
    case 'PG':
      return generateSampleData(100, 160, 1.5); // Procter & Gamble ~$160
    case 'BAC':
      return generateSampleData(100, 35, 0.5); // Bank of America ~$35
    case 'KO':
      return generateSampleData(100, 60, 0.5); // Coca-Cola ~$60
    case 'DIS':
      return generateSampleData(100, 110, 1.5); // Disney ~$110
    case 'PFE':
      return generateSampleData(100, 28, 0.5); // Pfizer ~$28
    case 'NFLX':
      return generateSampleData(100, 600, 8); // Netflix ~$600
    case 'INTC':
      return generateSampleData(100, 40, 0.8); // Intel ~$40
    // Cryptocurrencies also supported
    case 'BTC-USD':
    case 'BTCUSD':
      return getBtcUsdData();
    case 'ETH-USD':
    case 'ETHUSD':
      return getEthUsdData();
    case 'SOL-USD':
    case 'SOLUSD':
      return getSolUsdData();
    // Commodities or ETFs
    case 'SPY':
      return generateSampleData(100, 500, 4); // S&P 500 ETF
    case 'QQQ':
      return generateSampleData(100, 420, 3.5); // Nasdaq ETF
    case 'ES':
    case 'ES=F':
      return generateSampleData(100, 5200, 25); // E-mini S&P 500 Futures
    // Default for any other ticker
    default:
      return generateSampleData(100, 100, 2); // Generic sample data
  }
}; 