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
    volume: volumeData[index],
  }));
};

export const getBtcUsdData = () => {
  return generateSampleData(100, 28000, 800);
};

export const getEthUsdData = () => {
  return generateSampleData(100, 1700, 100);
};

export const getSolUsdData = () => {
  return generateSampleData(100, 55, 4);
};

export const getXrpUsdData = () => {
  return generateSampleData(100, 0.5, 0.02);
};

export const getAdaUsdData = () => {
  return generateSampleData(100, 0.45, 0.02);
};

export const getDogeUsdData = () => {
  return generateSampleData(100, 0.12, 0.01);
};

/**
 * This function provides fallback sample data for the requested crypto ticker.
 * It supports a variety of cryptocurrencies with appropriate price scales.
 */

// This function provides fallback sample data for the requested ticker.
export const getSampleData = (ticker: string): ChartData[] => {
  switch (ticker.toUpperCase()) {
    case 'BTC-USD':
      return getBtcUsdData();
    case 'ETH-USD':
      return getEthUsdData();
    case 'SOL-USD':
      return getSolUsdData();
    case 'XRP-USD':
      return getXrpUsdData();
    case 'ADA-USD':
      return getAdaUsdData();
    case 'DOGE-USD':
      return getDogeUsdData();
    // For any other crypto symbol, use a generic sample with realistic price scales
    default:
      // Check if ticker likely represents a major or micro cap crypto
      if (ticker.includes('BTC') || ticker.includes('ETH')) {
        return generateSampleData(100, 1000, 50); // Higher price crypto
      } else {
        return generateSampleData(100, 5, 0.5); // Lower price crypto
      }
  }
};
