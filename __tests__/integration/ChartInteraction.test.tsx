import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartContainer from '@/components/chart/ChartContainer';
import * as apiService from '@/lib/apiService';
import * as indicatorsService from '@/lib/indicatorsService';
import polygonWebSocketService from '@/lib/websocketService';

// Mock API and WebSocket services
jest.mock('@/lib/apiService');
jest.mock('@/lib/indicatorsService');
jest.mock('@/lib/websocketService');

// We won't mock the actual components for this integration test
// But we still need to mock external dependencies to control test environment

describe('Chart Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    (apiService.fetchPolygonAggregates as jest.Mock).mockResolvedValue({
      data: [
        { time: 1641013200, open: 100, high: 105, low: 98, close: 102, volume: 1000000 },
        { time: 1641099600, open: 102, high: 107, low: 101, close: 105, volume: 1200000 },
      ],
      error: undefined,
      warning: undefined
    });
    
    // Mock indicators calculations
    (indicatorsService.calculateSMA as jest.Mock).mockImplementation((data) => {
      return data.map((candle: { time: number; close: number }) => ({
        time: candle.time,
        value: candle.close // Simplified mock, real SMA would use period
      }));
    });
    
    (indicatorsService.calculateEMA as jest.Mock).mockImplementation((data) => {
      return data.map((candle: { time: number; close: number }) => ({
        time: candle.time,
        value: candle.close * 1.05 // Simplified mock with slight difference from close
      }));
    });
    
    (indicatorsService.calculateMACD as jest.Mock).mockImplementation((data) => {
      return data.map((candle: { time: number; close: number }) => ({
        time: candle.time,
        macd: candle.close * 0.02,
        signal: candle.close * 0.01,
        histogram: candle.close * 0.01
      }));
    });
    
    // Mock WebSocket methods
    polygonWebSocketService.init = jest.fn();
    polygonWebSocketService.connectToSymbol = jest.fn();
    polygonWebSocketService.disconnect = jest.fn();
    polygonWebSocketService.onMessage = jest.fn();
  });
  
  test('User flow: Change symbol, timeframe, and add indicator', async () => {
    // Render the ChartContainer component
    const { unmount } = render(<ChartContainer />);
    
    // Wait for the initial data load
    await waitFor(() => {
      expect(apiService.fetchPolygonAggregates).toHaveBeenCalledTimes(1);
    });
    
    // Find and click the symbol selector
    const symbolSelector = screen.getByTestId('symbol-selector');
    fireEvent.click(symbolSelector);
    
    // Select a new symbol (Microsoft)
    const msftOption = screen.getByText('MSFT');
    fireEvent.click(msftOption);
    
    // Verify the API was called with the new symbol
    await waitFor(() => {
      expect(apiService.fetchPolygonAggregates).toHaveBeenCalledWith(
        expect.stringMatching(/MSFT/),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });
    
    // Change the timeframe
    const timeframeSelector = screen.getByTestId('timeframe-selector');
    fireEvent.click(timeframeSelector);
    
    // Select the 1-hour timeframe
    const hourOption = screen.getByText('1H');
    fireEvent.click(hourOption);
    
    // Verify the API was called with the new timeframe
    await waitFor(() => {
      expect(apiService.fetchPolygonAggregates).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/1H/),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });
    
    // Open the indicators menu
    const indicatorsButton = screen.getByTestId('indicators-button');
    fireEvent.click(indicatorsButton);
    
    // Add an SMA indicator
    const smaOption = screen.getByText('Simple Moving Average (SMA)');
    fireEvent.click(smaOption);
    
    // Set the period for the SMA
    const periodInput = screen.getByLabelText('Period');
    fireEvent.change(periodInput, { target: { value: '20' } });
    
    // Click the add button
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    // Verify the SMA indicator was added
    await waitFor(() => {
      expect(screen.getByText('SMA 20')).toBeInTheDocument();
    });
    
    // Verify the indicator service was called
    expect(indicatorsService.calculateSMA).toHaveBeenCalled();
    
    // Now add a MACD indicator
    fireEvent.click(indicatorsButton);
    const macdOption = screen.getByText('MACD');
    fireEvent.click(macdOption);
    
    // Click the add button for MACD
    const addMacdButton = screen.getByText('Add');
    fireEvent.click(addMacdButton);
    
    // Verify the MACD indicator was added
    await waitFor(() => {
      expect(screen.getByText('MACD')).toBeInTheDocument();
    });
    
    // Verify the indicator service was called
    expect(indicatorsService.calculateMACD).toHaveBeenCalled();
    
    // Remove the SMA indicator
    const removeButton = screen.getAllByText('Remove')[0];
    fireEvent.click(removeButton);
    
    // Verify the SMA indicator was removed
    await waitFor(() => {
      expect(screen.queryByText('SMA 20')).not.toBeInTheDocument();
    });
    
    // Verify cleanup on unmount
    unmount();
    expect(polygonWebSocketService.disconnect).toHaveBeenCalled();
  });
  
  test('User flow: Chart interaction with real-time data', async () => {
    // Setup WebSocket mock callback before rendering
    let mockMessageHandler: ((event: { data: string }) => void) | undefined;
    (polygonWebSocketService.onMessage as jest.Mock).mockImplementation((callback) => {
      mockMessageHandler = callback;
    });
    
    // Render the ChartContainer component
    render(<ChartContainer />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(apiService.fetchPolygonAggregates).toHaveBeenCalledTimes(1);
    });
    
    // Ensure the WebSocket handler was registered
    expect(polygonWebSocketService.onMessage).toHaveBeenCalled();
    
    // Only simulate data if the handler was registered
    if (mockMessageHandler) {
      // Simulate real-time data coming in
      mockMessageHandler({
        data: JSON.stringify({
          ev: 'A',
          sym: 'AAPL',
          v: 100,
          o: 150.25,
          c: 152.35,
          h: 153.10,
          l: 149.95,
          t: Date.now()
        })
      });
    }
    
    // Verify the chart updates with the new data
    // This is difficult to test directly without mocking the actual chart rendering
    // Instead, we can check if the component doesn't crash and still renders
    
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
  
  test('Error handling: API failure', async () => {
    // Mock API error
    (apiService.fetchPolygonAggregates as jest.Mock).mockResolvedValue({
      data: [],
      error: 'Failed to fetch data: API rate limit exceeded',
      warning: undefined
    });
    
    // Render the ChartContainer component
    render(<ChartContainer />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/API rate limit exceeded/i)).toBeInTheDocument();
    });
    
    // Try changing symbol to see if it recovers
    const symbolSelector = screen.getByTestId('symbol-selector');
    fireEvent.click(symbolSelector);
    
    // Select a new symbol (Tesla)
    const tslaOption = screen.getByText('TSLA');
    fireEvent.click(tslaOption);
    
    // Mock successful response for the new symbol
    (apiService.fetchPolygonAggregates as jest.Mock).mockResolvedValue({
      data: [
        { time: 1641013200, open: 1100, high: 1150, low: 1090, close: 1120, volume: 5000000 },
        { time: 1641099600, open: 1120, high: 1170, low: 1110, close: 1160, volume: 6000000 },
      ],
      error: undefined,
      warning: undefined
    });
    
    // Verify the chart recovers and displays data
    await waitFor(() => {
      expect(screen.queryByText(/API rate limit exceeded/i)).not.toBeInTheDocument();
    });
  });
}); 