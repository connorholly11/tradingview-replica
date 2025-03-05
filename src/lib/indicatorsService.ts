import { 
  RSI, 
  SMA, 
  EMA, 
  MACD, 
  BollingerBands, 
  StochasticRSI, 
  OBV 
} from 'technicalindicators';
import { ChartData } from './apiService';

// Custom interfaces for indicator outputs
export interface MACDResult {
  MACD: number;
  signal: number;
  histogram: number;
}

export interface BollingerBandsResult {
  upper: number;
  middle: number;
  lower: number;
}

export interface StochasticRSIResult {
  stochRSI: number;
  k: number;
  d: number;
}

// Extract price data from ChartData array
export function getPriceData(data: ChartData[]): number[] {
  return data.map(item => item.close);
}

export function getHighData(data: ChartData[]): number[] {
  return data.map(item => item.high);
}

export function getLowData(data: ChartData[]): number[] {
  return data.map(item => item.low);
}

export function getVolumeData(data: ChartData[]): number[] {
  return data.map(item => item.volume || 0);
}

export function getOpenData(data: ChartData[]): number[] {
  return data.map(item => item.open);
}

export function getCloseData(data: ChartData[]): number[] {
  return data.map(item => item.close);
}

// Calculate RSI (Relative Strength Index)
export function calculateRSI(data: ChartData[], period: number = 14): number[] {
  const prices = getPriceData(data);
  const rsiInput = {
    values: prices,
    period
  };
  
  return RSI.calculate(rsiInput);
}

// Calculate SMA (Simple Moving Average)
export function calculateSMA(data: ChartData[], period: number = 20): number[] {
  const prices = getPriceData(data);
  const smaInput = {
    values: prices,
    period
  };
  
  return SMA.calculate(smaInput);
}

// Calculate EMA (Exponential Moving Average)
export function calculateEMA(data: ChartData[], period: number = 20): number[] {
  const prices = getPriceData(data);
  const emaInput = {
    values: prices,
    period
  };
  
  return EMA.calculate(emaInput);
}

// Calculate MACD (Moving Average Convergence Divergence)
export function calculateMACD(
  data: ChartData[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): MACDResult[] {
  const prices = getPriceData(data);
  const macdInput = {
    values: prices,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  };
  
  const result = MACD.calculate(macdInput);
  return result.map(item => ({
    MACD: item.MACD || 0,
    signal: item.signal || 0,
    histogram: item.histogram || 0
  }));
}

// Calculate Bollinger Bands
export function calculateBollingerBands(
  data: ChartData[], 
  period: number = 20, 
  stdDev: number = 2
): BollingerBandsResult[] {
  const prices = getPriceData(data);
  const bbInput = {
    values: prices,
    period,
    stdDev
  };
  
  const result = BollingerBands.calculate(bbInput);
  return result.map(item => ({
    upper: item.upper,
    middle: item.middle,
    lower: item.lower
  }));
}

// Calculate Stochastic RSI
export function calculateStochasticRSI(
  data: ChartData[], 
  rsiPeriod: number = 14, 
  stochasticPeriod: number = 14, 
  kPeriod: number = 3, 
  dPeriod: number = 3
): StochasticRSIResult[] {
  const prices = getPriceData(data);
  const stochRSIInput = {
    values: prices,
    rsiPeriod,
    stochasticPeriod,
    kPeriod,
    dPeriod
  };
  
  const result = StochasticRSI.calculate(stochRSIInput);
  return result.map(item => ({
    stochRSI: item.stochRSI,
    k: item.k,
    d: item.d
  }));
}

// Calculate On-Balance Volume (OBV)
export function calculateOBV(data: ChartData[]): number[] {
  const closes = getCloseData(data);
  const volumes = getVolumeData(data);
  
  const obvInput = {
    close: closes,
    volume: volumes
  };
  
  return OBV.calculate(obvInput);
}

// Format indicator data for chart display
export function formatIndicatorData(times: number[], values: number[]): { time: number, value: number }[] {
  // Handle offset if indicator calculation results in fewer values than original data
  const offset = times.length - values.length;
  
  return values.map((value, index) => ({
    time: times[index + offset],
    value
  }));
}

// Helper function to create line series data for indicators
export function createIndicatorData(
  indicatorType: string,
  data: ChartData[],
  settings: Record<string, number>
): { time: number, value: number }[] | null {
  if (!data || data.length === 0) {
    return null;
  }
  
  let values: number[] = [];
  
  switch (indicatorType) {
    case 'sma': {
      const period = settings.period || 20;
      values = calculateSMA(data, period);
      break;
    }
    case 'ema': {
      const period = settings.period || 20;
      values = calculateEMA(data, period);
      break;
    }
    case 'rsi': {
      const period = settings.period || 14;
      values = calculateRSI(data, period);
      break;
    }
    // You can add more indicator types here
    default:
      return null;
  }
  
  if (!values || values.length === 0) {
    return null;
  }
  
  const times = data.map(item => item.time);
  return formatIndicatorData(times, values);
} 