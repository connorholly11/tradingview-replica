import { getTimeframeDateRange, fetchAggregatesUnified } from '../src/lib/apiService';
import { server } from './mocks/server';

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

describe('API Service', () => {
  describe('fetchAggregatesUnified', () => {
    it('should fetch data from Coinbase for crypto symbols', async () => {
      // Mock implementation uses server.ts which will handle the actual response
      const { data, warning } = await fetchAggregatesUnified('BTC-USD', '1D');

      // Verify no warnings
      expect(warning).toBeUndefined();

      // Verify data exists and has expected format
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);

      // Verify data point structure
      const firstPoint = data[0];
      expect(firstPoint).toHaveProperty('time');
      expect(firstPoint).toHaveProperty('open');
      expect(firstPoint).toHaveProperty('high');
      expect(firstPoint).toHaveProperty('low');
      expect(firstPoint).toHaveProperty('close');
      expect(firstPoint).toHaveProperty('volume');
    });

    it('should return sample data for non-crypto symbols', async () => {
      const { data, warning } = await fetchAggregatesUnified('AAPL', '1D');

      // There should be a warning since AAPL is not a crypto symbol
      expect(warning).toBeDefined();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
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
      
      // ~300 days back from 2023-03-30
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      expect(fromDate.getFullYear()).toBe(2022);
      expect(toDate.toISOString().split('T')[0]).toBe('2023-03-30');
    });

    it('should return appropriate date ranges for 1h timeframe', () => {
      const { from, to } = getTimeframeDateRange('1h');
      
      // ~12 days back from 2023-03-30
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      expect(fromDate.getMonth()).toBe(toDate.getMonth());
      expect(toDate.getDate() - fromDate.getDate()).toBeLessThanOrEqual(12);
    });

    it('should return appropriate date ranges for 1m timeframe', () => {
      const { from, to } = getTimeframeDateRange('1m');
      
      // ~5 hours back from 2023-03-30
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      expect(fromDate.getDate()).toBe(toDate.getDate());
      const hourDiff = toDate.getHours() - fromDate.getHours();
      expect(hourDiff >= 0 ? hourDiff : hourDiff + 24).toBeLessThanOrEqual(5);
    });
  });
}); 