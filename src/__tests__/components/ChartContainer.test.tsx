import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChartContainer from '@/components/chart/ChartContainer';
import * as apiService from '@/lib/apiService';
import polygonWebSocketService from '@/lib/websocketService';

// Import jest-dom for custom matchers
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@/components/chart/Chart', () => ({
  Chart: jest.fn(() => <div data-testid="mock-chart">Chart Component</div>)
}));

jest.mock('@/components/chart/ChartToolbar', () => 
  jest.fn(({ onSymbolChange, onTimeframeChange, onIndicatorAdd }) => (
    <div data-testid="mock-chart-toolbar">
      <button onClick={() => onSymbolChange('MSFT')}>Change Symbol</button>
      <button onClick={() => onTimeframeChange('1h')}>Change Timeframe</button>
      <button onClick={() => onIndicatorAdd({ id: 'sma20', type: 'sma', name: 'SMA 20', color: '#FF0000', visible: true, settings: { period: 20 } })}>
        Add Indicator
      </button>
    </div>
  ))
);

jest.mock('@/components/chart/ActiveIndicators', () => 
  jest.fn(({ indicators, onRemove }) => (
    <div data-testid="mock-active-indicators">
      {indicators?.map((ind: { id: string, name: string }) => (
        <div key={ind.id}>
          {ind.name}
          <button onClick={() => onRemove(ind.id)}>Remove</button>
        </div>
      ))}
    </div>
  ))
);

jest.mock('@/components/chart/DrawingToolbar', () => 
  jest.fn(() => <div data-testid="mock-drawing-toolbar">Drawing Toolbar</div>)
);

// Mock API and WebSocket
jest.mock('@/lib/apiService');
jest.mock('@/lib/websocketService');

describe('ChartContainer Component', () => {
  const mockFetchPolygonAggregates = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup API mock
    (apiService.fetchPolygonAggregates as jest.Mock).mockImplementation(
      mockFetchPolygonAggregates.mockResolvedValue({
        data: [
          { time: 1641013200, open: 100, high: 105, low: 98, close: 102, volume: 1000000 },
          { time: 1641099600, open: 102, high: 107, low: 101, close: 105, volume: 1200000 },
        ],
        error: undefined,
        warning: undefined
      })
    );
    
    // Setup WebSocket mock
    (polygonWebSocketService.init as jest.Mock) = jest.fn();
    (polygonWebSocketService.connectToSymbol as jest.Mock) = jest.fn();
    (polygonWebSocketService.disconnect as jest.Mock) = jest.fn();
  });

  it('renders the chart container with default props', async () => {
    render(<ChartContainer />);
    
    // Verify chart components are rendered
    expect(screen.getByTestId('mock-chart-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    
    // Verify API was called
    await waitFor(() => {
      expect(apiService.fetchPolygonAggregates).toHaveBeenCalled();
    });
  });

  it('changes symbol when toolbar triggers symbol change', async () => {
    render(<ChartContainer />);
    
    // Click the change symbol button
    fireEvent.click(screen.getByText('Change Symbol'));
    
    // Verify API was called with the new symbol
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
    
    // Verify WebSocket was called with the new symbol
    expect(polygonWebSocketService.connectToSymbol).toHaveBeenCalledWith('MSFT');
  });

  it('changes timeframe when toolbar triggers timeframe change', async () => {
    render(<ChartContainer />);
    
    // Click the change timeframe button
    fireEvent.click(screen.getByText('Change Timeframe'));
    
    // Verify API was called with the new timeframe
    await waitFor(() => {
      expect(apiService.fetchPolygonAggregates).toHaveBeenCalledTimes(2);
    });
  });

  it('adds and removes indicators', async () => {
    render(<ChartContainer />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(apiService.fetchPolygonAggregates).toHaveBeenCalled();
    });
    
    // Click to add an indicator
    fireEvent.click(screen.getByText('Add Indicator'));
    
    // Verify indicator is added
    await waitFor(() => {
      expect(screen.getByText('SMA 20')).toBeInTheDocument();
    });
    
    // Click to remove the indicator
    fireEvent.click(screen.getByText('Remove'));
    
    // Verify indicator is removed
    await waitFor(() => {
      expect(screen.queryByText('SMA 20')).not.toBeInTheDocument();
    });
  });

  it('displays error message when data fetch fails', async () => {
    // Mock API error
    (apiService.fetchPolygonAggregates as jest.Mock).mockResolvedValue({
      data: [],
      error: 'Failed to fetch data',
      warning: undefined
    });
    
    render(<ChartContainer />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument();
    });
  });

  it('displays warning message when data has warning', async () => {
    // Mock API warning
    (apiService.fetchPolygonAggregates as jest.Mock).mockResolvedValue({
      data: [
        { time: 1641013200, open: 100, high: 105, low: 98, close: 102, volume: 1000000 },
      ],
      error: undefined,
      warning: 'Data may be delayed'
    });
    
    render(<ChartContainer />);
    
    // Verify warning message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Data may be delayed/i)).toBeInTheDocument();
    });
  });

  it('cleans up WebSocket on unmount', async () => {
    const { unmount } = render(<ChartContainer />);
    
    // Unmount the component
    unmount();
    
    // Verify WebSocket disconnect was called
    expect(polygonWebSocketService.disconnect).toHaveBeenCalled();
  });
}); 