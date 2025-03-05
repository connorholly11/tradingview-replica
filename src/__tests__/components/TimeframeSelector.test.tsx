import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeframeSelector from '@/components/chart/TimeframeSelector';

// Add missing custom matchers from testing-library/jest-dom
interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveClass(className: string): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}

describe('TimeframeSelector Component', () => {
  const mockOnTimeframeChange = jest.fn();

  beforeEach(() => {
    mockOnTimeframeChange.mockClear();
  });

  it('renders all timeframe options', () => {
    render(
      <TimeframeSelector 
        currentTimeframe="1D" 
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    // Check that all timeframes are rendered
    const expectedTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'];
    expectedTimeframes.forEach(timeframe => {
      expect(screen.getByText(timeframe)).toBeInTheDocument();
    });
  });

  it('highlights the selected timeframe', () => {
    const currentTimeframe = '1D';
    
    render(
      <TimeframeSelector 
        currentTimeframe={currentTimeframe} 
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    // The selected timeframe should have a different styling (bg-blue-500)
    const selectedElement = screen.getByText(currentTimeframe);
    expect(selectedElement).toHaveClass('bg-blue-500');
  });

  it('calls onTimeframeChange when a timeframe is clicked', () => {
    render(
      <TimeframeSelector 
        currentTimeframe="1D" 
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    // Click on a different timeframe
    fireEvent.click(screen.getByText('1h'));
    
    // Check if onTimeframeChange was called with the correct timeframe
    expect(mockOnTimeframeChange).toHaveBeenCalledWith('1h');
  });

  it('still calls onTimeframeChange when clicking the already selected timeframe', () => {
    const currentTimeframe = '1D';
    
    render(
      <TimeframeSelector 
        currentTimeframe={currentTimeframe} 
        onTimeframeChange={mockOnTimeframeChange}
      />
    );

    // Click on the already selected timeframe
    fireEvent.click(screen.getByText(currentTimeframe));
    
    // onTimeframeChange should still be called
    expect(mockOnTimeframeChange).toHaveBeenCalledWith(currentTimeframe);
  });
}); 