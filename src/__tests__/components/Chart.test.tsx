import React from 'react';
import { render } from '@testing-library/react';
import { Chart } from '@/components/chart/Chart';
import { ChartData } from '@/lib/apiService';
import { UTCTimestamp } from 'lightweight-charts';

// Import custom matchers from jest-dom
import '@testing-library/jest-dom';

// Generate sample chart data for testing
const generateSampleData = (count: number = 20): ChartData[] => {
  const data: ChartData[] = [];
  let price = 100;
  
  for (let i = 0; i < count; i++) {
    // Generate some price movements
    const change = (Math.random() - 0.5) * 2;
    price = Math.max(price + change, 1);
    
    const time = (1641013200 + i * 86400) as UTCTimestamp; // Start from 2022-01-01
    
    data.push({
      time,
      open: price - 0.5,
      high: price + 1,
      low: price - 1,
      close: price + 0.5,
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }
  
  return data;
};

// Create an example indicator config
const sampleIndicators = [
  {
    id: 'sma20',
    type: 'sma',
    name: 'SMA 20',
    color: '#FF0000',
    visible: true,
    settings: { period: 20 }
  },
  {
    id: 'ema50',
    type: 'ema',
    name: 'EMA 50',
    color: '#00FF00',
    visible: true,
    settings: { period: 50 }
  }
];

describe('Chart Component', () => {
  let sampleData: ChartData[];
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    sampleData = generateSampleData(50);
    // Suppress specific React error messages related to lightweight-charts
    console.error = jest.fn();
  });
  
  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('renders the chart with the provided data', () => {
    const { container } = render(
      <Chart 
        data={sampleData} 
        chartType="candle"
      />
    );
    
    // Since lightweight-charts creates a canvas element, check if it's rendered
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders with custom colors', () => {
    const customColors = {
      backgroundColor: '#000000',
      lineColor: '#FFFFFF',
      textColor: '#CCCCCC',
      areaTopColor: 'rgba(255, 255, 255, 0.4)',
      areaBottomColor: 'rgba(255, 255, 255, 0.1)',
    };
    
    const { container } = render(
      <Chart 
        data={sampleData} 
        chartType="candle"
        colors={customColors}
      />
    );
    
    // Since lightweight-charts creates a canvas element, check if it's rendered
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders with indicators', () => {
    const { container } = render(
      <Chart 
        data={sampleData} 
        chartType="candle"
        indicators={sampleIndicators}
      />
    );
    
    // Since lightweight-charts creates a canvas element, check if it's rendered
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders with line chart type', () => {
    const { container } = render(
      <Chart 
        data={sampleData} 
        chartType="line"
      />
    );
    
    // Since lightweight-charts creates a canvas element, check if it's rendered
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders with bar chart type', () => {
    const { container } = render(
      <Chart 
        data={sampleData} 
        chartType="bar"
      />
    );
    
    // Since lightweight-charts creates a canvas element, check if it's rendered
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const { container } = render(
      <Chart 
        data={[]} 
        chartType="candle"
      />
    );
    
    // Chart should still render even with empty data
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
}); 