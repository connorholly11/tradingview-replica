import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands 
} from '../src/lib/indicatorsService';
import { ChartData } from '../src/lib/apiService';
import { UTCTimestamp } from 'lightweight-charts';

// Sample data for testing
const generateSampleData = (length: number = 100): ChartData[] => {
  const data: ChartData[] = [];
  let price = 100;
  const volatility = 2;
  
  for (let i = 0; i < length; i++) {
    // Generate some price movements that follow a pattern
    // Uptrend for first half, downtrend for second half
    const trend = i < length / 2 ? 0.2 : -0.2;
    const change = (Math.random() - 0.5) * volatility + trend;
    price = Math.max(price + change, 1); // Ensure price is always positive
    
    const time = (1641013200 + i * 86400) as UTCTimestamp; // Start from 2022-01-01
    const volatilityFactor = Math.random() * volatility;
    
    data.push({
      time,
      open: price,
      high: price + volatilityFactor,
      low: price - volatilityFactor,
      close: price + (Math.random() - 0.5) * volatilityFactor,
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }
  
  return data;
};

describe('Technical Indicators Service', () => {
  let sampleData: ChartData[];
  
  beforeEach(() => {
    sampleData = generateSampleData(100);
  });
  
  describe('Simple Moving Average (SMA)', () => {
    it('should calculate SMA with default period (20)', () => {
      const result = calculateSMA(sampleData);
      
      // We expect the result to have array length of original data - period + 1
      expect(result).toHaveLength(sampleData.length - 20 + 1);
      
      // Check that all values are numbers
      result.forEach(value => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
      });
    });
    
    it('should calculate SMA with custom period', () => {
      const period = 10;
      const result = calculateSMA(sampleData, period);
      
      // We expect the result to have array length of original data - period + 1
      expect(result).toHaveLength(sampleData.length - period + 1);
    });
    
    it('should handle empty data array', () => {
      const result = calculateSMA([]);
      expect(result).toHaveLength(0);
    });
  });
  
  describe('Exponential Moving Average (EMA)', () => {
    it('should calculate EMA with default period (20)', () => {
      const result = calculateEMA(sampleData);
      
      // We expect the result to have array length of original data - period + 1
      expect(result).toHaveLength(sampleData.length - 20 + 1);
      
      // Check that all values are numbers
      result.forEach(value => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
      });
    });
    
    it('should calculate EMA with custom period', () => {
      const period = 10;
      const result = calculateEMA(sampleData, period);
      
      // We expect the result to have array length of original data - period + 1
      expect(result).toHaveLength(sampleData.length - period + 1);
    });
    
    it('should handle empty data array', () => {
      const result = calculateEMA([]);
      expect(result).toHaveLength(0);
    });
  });
  
  describe('Relative Strength Index (RSI)', () => {
    it('should calculate RSI with default period (14)', () => {
      const result = calculateRSI(sampleData);
      
      // RSI should have length of data - period
      expect(result).toHaveLength(sampleData.length - 14);
      
      // RSI values should be between 0 and 100
      result.forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
    
    it('should calculate RSI with custom period', () => {
      const period = 7;
      const result = calculateRSI(sampleData, period);
      
      // RSI should have length of data - period
      expect(result).toHaveLength(sampleData.length - period);
    });
    
    it('should handle empty data array', () => {
      const result = calculateRSI([]);
      expect(result).toHaveLength(0);
    });
  });
  
  describe('Moving Average Convergence Divergence (MACD)', () => {
    it('should calculate MACD with default parameters', () => {
      const result = calculateMACD(sampleData);
      
      // MACD should start returning values after slowPeriod data points
      expect(result).toHaveLength(sampleData.length - 26);
      
      // Each result should have MACD, signal, and histogram properties
      result.forEach(item => {
        expect(item).toHaveProperty('MACD');
        expect(item).toHaveProperty('signal');
        expect(item).toHaveProperty('histogram');
        
        // Values should be numbers
        expect(typeof item.MACD).toBe('number');
        expect(typeof item.signal).toBe('number');
        expect(typeof item.histogram).toBe('number');
      });
    });
    
    it('should calculate MACD with custom parameters', () => {
      const fastPeriod = 8;
      const slowPeriod = 16;
      const signalPeriod = 6;
      
      const result = calculateMACD(sampleData, fastPeriod, slowPeriod, signalPeriod);
      
      // MACD should start returning values after slowPeriod data points
      expect(result).toHaveLength(sampleData.length - slowPeriod);
    });
    
    it('should handle empty data array', () => {
      const result = calculateMACD([]);
      expect(result).toHaveLength(0);
    });
  });
  
  describe('Bollinger Bands', () => {
    it('should calculate Bollinger Bands with default parameters', () => {
      const result = calculateBollingerBands(sampleData);
      
      // Bollinger Bands should start returning values after period data points
      expect(result).toHaveLength(sampleData.length - 20 + 1);
      
      // Each result should have upper, middle, and lower properties
      result.forEach(item => {
        expect(item).toHaveProperty('upper');
        expect(item).toHaveProperty('middle');
        expect(item).toHaveProperty('lower');
        
        // Upper band should be higher than middle, which should be higher than lower
        expect(item.upper).toBeGreaterThan(item.middle);
        expect(item.middle).toBeGreaterThan(item.lower);
      });
    });
    
    it('should calculate Bollinger Bands with custom parameters', () => {
      const period = 10;
      const stdDev = 3;
      
      const result = calculateBollingerBands(sampleData, period, stdDev);
      
      // Bollinger Bands should start returning values after period data points
      expect(result).toHaveLength(sampleData.length - period + 1);
      
      // With 3 standard deviations, the bands should be wider
      const defaultResult = calculateBollingerBands(sampleData, period, 2);
      
      // Check at least one point to verify bands are wider with higher stdDev
      expect(result[0].upper - result[0].lower).toBeGreaterThan(
        defaultResult[0].upper - defaultResult[0].lower
      );
    });
    
    it('should handle empty data array', () => {
      const result = calculateBollingerBands([]);
      expect(result).toHaveLength(0);
    });
  });
}); 