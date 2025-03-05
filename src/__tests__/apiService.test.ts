import { fetchPolygonAggregates, mapTimeframeToPolygonParams, getTimeframeDateRange } from '@/lib/apiService';
import { server } from './mocks/server';

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

describe('API Service', () => {
  describe('fetchPolygonAggregates', () => {
    it('should fetch and transform data successfully', async () => {
      const { data, error, warning } = await fetchPolygonAggregates(
        'AAPL',
        1,
        'day',
        '2023-03-27',
        '2023-03-29',
        true
      );

      // Verify no errors or warnings
      expect(error).toBeUndefined();
      expect(warning).toBeUndefined();

      // Verify data exists and has expected format
      expect(data).toBeDefined();
      expect(data.length).toBe(3);

      // Verify first data point transformed correctly
      const firstPoint = data[0];
      expect(firstPoint).toHaveProperty('time');
      expect(firstPoint).toHaveProperty('open');
      expect(firstPoint).toHaveProperty('high');
      expect(firstPoint).toHaveProperty('low');
      expect(firstPoint).toHaveProperty('close');
      expect(firstPoint).toHaveProperty('volume');
    });

    it('should return data for different tickers', async () => {
      const { data: appleData } = await fetchPolygonAggregates(
        'AAPL',
        1,
        'day',
        '2023-03-27',
        '2023-03-29',
        true
      );

      const { data: microsoftData } = await fetchPolygonAggregates(
        'MSFT',
        1,
        'day',
        '2023-03-27',
        '2023-03-29',
        true
      );

      // Check that data points exist
      expect(appleData).toBeDefined();
      expect(microsoftData).toBeDefined();
      
      // Microsoft prices should be higher than Apple (based on our mock)
      expect(microsoftData[0].close).toBeGreaterThan(appleData[0].close);
    });
  });

  describe('mapTimeframeToPolygonParams', () => {
    it('should map 1m timeframe correctly', () => {
      const result = mapTimeframeToPolygonParams('1m');
      expect(result).toEqual({ multiplier: 1, timespan: 'minute' });
    });

    it('should map 1h timeframe correctly', () => {
      const result = mapTimeframeToPolygonParams('1h');
      expect(result).toEqual({ multiplier: 1, timespan: 'hour' });
    });

    it('should map 1D timeframe correctly', () => {
      const result = mapTimeframeToPolygonParams('1D');
      expect(result).toEqual({ multiplier: 1, timespan: 'day' });
    });

    it('should map 1W timeframe correctly', () => {
      const result = mapTimeframeToPolygonParams('1W');
      expect(result).toEqual({ multiplier: 1, timespan: 'week' });
    });

    it('should map 1M timeframe correctly', () => {
      const result = mapTimeframeToPolygonParams('1M');
      expect(result).toEqual({ multiplier: 1, timespan: 'month' });
    });
  });

  describe('getTimeframeDateRange', () => {
    beforeEach(() => {
      // Mock current date to 2023-03-30
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-03-30'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return appropriate date ranges for 1D timeframe', () => {
      const { from, to } = getTimeframeDateRange('1D');
      
      // 30 days back from 2023-03-30
      expect(from).toMatch(/2023-02-\d{2}/);
      expect(to).toBe('2023-03-30');
    });

    it('should return appropriate date ranges for 1W timeframe', () => {
      const { from, to } = getTimeframeDateRange('1W');
      
      // 52 weeks back from 2023-03-30
      expect(from).toMatch(/2022-\d{2}-\d{2}/);
      expect(to).toBe('2023-03-30');
    });

    it('should return appropriate date ranges for 1M timeframe', () => {
      const { from, to } = getTimeframeDateRange('1M');
      
      // 12 months back from 2023-03-30
      expect(from).toMatch(/2022-\d{2}-\d{2}/);
      expect(to).toBe('2023-03-30');
    });
  });
}); 