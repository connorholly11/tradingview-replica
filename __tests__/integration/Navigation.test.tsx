import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import StatsPage from '@/app/stats/page';
import { useRouter, usePathname } from 'next/navigation';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}));

// Mock the WebSocket connection used in chart components
jest.mock('@/hooks/useRealtimePriceData', () => ({
  __esModule: true,
  default: () => ({
    lastPrice: 150.25,
    priceChange: 2.5,
    priceHistory: [],
    high: 151.75,
    low: 148.50,
    connectionStatus: 'connected'
  })
}));

// Mock the lightweight-charts library
jest.mock('lightweight-charts', () => ({
  createChart: jest.fn(() => ({
    resize: jest.fn(),
    timeScale: jest.fn(() => ({
      fitContent: jest.fn(),
      applyOptions: jest.fn()
    })),
    applyOptions: jest.fn(),
    subscribeCrosshairMove: jest.fn(),
    unsubscribeCrosshairMove: jest.fn(),
    remove: jest.fn(),
    addCandlestickSeries: jest.fn(() => ({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn()
    })),
    addLineSeries: jest.fn(() => ({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn()
    })),
    addBarSeries: jest.fn(() => ({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn()
    }))
  }))
}));

describe('Navigation Integration Tests', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });
  
  it('renders the Home page with Chart view by default', () => {
    // Set the path to home
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Home />);
    
    // Verify the Chart tab is active
    const chartTab = screen.getByText('Chart').closest('div');
    expect(chartTab).toHaveClass('text-white');
    expect(chartTab).toHaveClass('border-blue-500');
    
    // Verify chart components are visible
    expect(screen.getByText('Chart')).toBeInTheDocument();
  });
  
  it('navigates from Home to Stats page when clicking Stats tab', () => {
    // Set the path to home
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Home />);
    
    // Click the Stats tab
    fireEvent.click(screen.getByText('Stats'));
    
    // Verify router.push was called with /stats
    expect(mockPush).toHaveBeenCalledWith('/stats');
  });
  
  it('renders the Stats page correctly', () => {
    // Set the path to stats
    (usePathname as jest.Mock).mockReturnValue('/stats');
    
    render(<StatsPage />);
    
    // Verify the Stats tab is active
    const statsTab = screen.getByText('Stats').closest('div');
    expect(statsTab).toHaveClass('text-white');
    expect(statsTab).toHaveClass('border-blue-500');
    
    // Verify stats components are visible
    expect(screen.getByText('Trading Statistics')).toBeInTheDocument();
    expect(screen.getByText('Recent Trades')).toBeInTheDocument();
  });
  
  it('navigates from Stats to Home page when clicking Chart tab', () => {
    // Set the path to stats
    (usePathname as jest.Mock).mockReturnValue('/stats');
    
    render(<StatsPage />);
    
    // Click the Chart tab
    fireEvent.click(screen.getByText('Chart'));
    
    // Verify router.push was called with /
    expect(mockPush).toHaveBeenCalledWith('/');
  });
}); 