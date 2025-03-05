import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndicatorSelector from '@/components/indicators/IndicatorSelector';

describe('IndicatorSelector Component', () => {
  const mockOnAdd = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly with default props', () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Check if the dropdown button is rendered
    expect(screen.getByText(/Add Indicator/i)).toBeInTheDocument();
    
    // Dropdown should be closed initially
    expect(screen.queryByText(/Simple Moving Average/i)).not.toBeInTheDocument();
  });
  
  it('opens the dropdown when clicked', () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Click the dropdown button
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Check if dropdown options are displayed
    expect(screen.getByText(/Simple Moving Average/i)).toBeInTheDocument();
    expect(screen.getByText(/Exponential Moving Average/i)).toBeInTheDocument();
    expect(screen.getByText(/MACD/i)).toBeInTheDocument();
    expect(screen.getByText(/Relative Strength Index/i)).toBeInTheDocument();
  });
  
  it('closes the dropdown when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside">Outside Element</div>
        <IndicatorSelector onAdd={mockOnAdd} />
      </div>
    );
    
    // Open the dropdown
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Verify dropdown is open
    expect(screen.getByText(/Simple Moving Average/i)).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    // Verify dropdown is closed
    await waitFor(() => {
      expect(screen.queryByText(/Simple Moving Average/i)).not.toBeInTheDocument();
    });
  });
  
  it('displays the settings form when an indicator is selected', () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Select SMA indicator
    fireEvent.click(screen.getByText(/Simple Moving Average/i));
    
    // Verify settings form is displayed
    expect(screen.getByText(/SMA Settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color/i)).toBeInTheDocument();
  });
  
  it('adds an SMA indicator with custom settings', () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Select SMA indicator
    fireEvent.click(screen.getByText(/Simple Moving Average/i));
    
    // Update settings
    fireEvent.change(screen.getByLabelText(/Period/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Color/i), { target: { value: '#00FF00' } });
    
    // Add the indicator
    fireEvent.click(screen.getByText(/Add/i));
    
    // Verify onAdd was called with correct params
    expect(mockOnAdd).toHaveBeenCalledWith({
      id: expect.any(String),
      type: 'sma',
      name: 'SMA 50',
      color: '#00FF00',
      visible: true,
      settings: { period: 50 }
    });
  });
  
  it('adds an EMA indicator with custom settings', () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Select EMA indicator
    fireEvent.click(screen.getByText(/Exponential Moving Average/i));
    
    // Update settings
    fireEvent.change(screen.getByLabelText(/Period/i), { target: { value: '21' } });
    fireEvent.change(screen.getByLabelText(/Color/i), { target: { value: '#FF00FF' } });
    
    // Add the indicator
    fireEvent.click(screen.getByText(/Add/i));
    
    // Verify onAdd was called with correct params
    expect(mockOnAdd).toHaveBeenCalledWith({
      id: expect.any(String),
      type: 'ema',
      name: 'EMA 21',
      color: '#FF00FF',
      visible: true,
      settings: { period: 21 }
    });
  });
  
  it('adds an RSI indicator with custom settings', () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Select RSI indicator
    fireEvent.click(screen.getByText(/Relative Strength Index/i));
    
    // Update settings
    fireEvent.change(screen.getByLabelText(/Period/i), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText(/Color/i), { target: { value: '#FF0000' } });
    fireEvent.change(screen.getByLabelText(/Overbought/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/Oversold/i), { target: { value: '20' } });
    
    // Add the indicator
    fireEvent.click(screen.getByText(/Add/i));
    
    // Verify onAdd was called with correct params
    expect(mockOnAdd).toHaveBeenCalledWith({
      id: expect.any(String),
      type: 'rsi',
      name: 'RSI 14',
      color: '#FF0000',
      visible: true,
      settings: { 
        period: 14,
        overbought: 80,
        oversold: 20
      }
    });
  });
  
  it('adds a MACD indicator with custom settings', () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Select MACD indicator
    fireEvent.click(screen.getByText(/MACD/i));
    
    // Update settings
    fireEvent.change(screen.getByLabelText(/Fast Period/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Slow Period/i), { target: { value: '26' } });
    fireEvent.change(screen.getByLabelText(/Signal Period/i), { target: { value: '9' } });
    
    // Add the indicator
    fireEvent.click(screen.getByText(/Add/i));
    
    // Verify onAdd was called with correct params
    expect(mockOnAdd).toHaveBeenCalledWith({
      id: expect.any(String),
      type: 'macd',
      name: 'MACD',
      color: expect.any(String),
      visible: true,
      settings: { 
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      }
    });
  });
  
  it('cancels indicator selection when Cancel button is clicked', async () => {
    render(<IndicatorSelector onAdd={mockOnAdd} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText(/Add Indicator/i));
    
    // Select MACD indicator
    fireEvent.click(screen.getByText(/MACD/i));
    
    // Verify settings form is displayed
    expect(screen.getByText(/MACD Settings/i)).toBeInTheDocument();
    
    // Click Cancel
    fireEvent.click(screen.getByText(/Cancel/i));
    
    // Verify we're back to the main dropdown
    await waitFor(() => {
      expect(screen.queryByText(/MACD Settings/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Simple Moving Average/i)).toBeInTheDocument();
    });
    
    // onAdd should not have been called
    expect(mockOnAdd).not.toHaveBeenCalled();
  });
}); 