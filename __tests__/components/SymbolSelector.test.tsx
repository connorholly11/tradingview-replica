import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SymbolSelector from '@/components/chart/SymbolSelector';

// Import custom matchers from jest-dom
import '@testing-library/jest-dom';

describe('SymbolSelector Component', () => {
  const mockOnSymbolChange = jest.fn();

  beforeEach(() => {
    mockOnSymbolChange.mockClear();
  });

  it('renders with the current symbol displayed', () => {
    render(
      <SymbolSelector 
        currentSymbol="AAPL" 
        onSymbolChange={mockOnSymbolChange}
      />
    );

    // Check that the current symbol is displayed
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('shows the dropdown when clicked', async () => {
    render(
      <SymbolSelector 
        currentSymbol="AAPL" 
        onSymbolChange={mockOnSymbolChange}
      />
    );

    // Initially, dropdown should be hidden
    expect(screen.queryByText('Microsoft Corporation')).not.toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(screen.getByText('AAPL'));

    // Dropdown should be visible now
    await waitFor(() => {
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
    });
  });

  it('allows selecting a different symbol', async () => {
    render(
      <SymbolSelector 
        currentSymbol="AAPL" 
        onSymbolChange={mockOnSymbolChange}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('AAPL'));

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
    });

    // Click on a different symbol
    fireEvent.click(screen.getByText('Microsoft Corporation'));

    // Check if onSymbolChange was called with the correct symbol
    expect(mockOnSymbolChange).toHaveBeenCalledWith('MSFT');
  });

  it('allows searching for symbols', async () => {
    render(
      <SymbolSelector 
        currentSymbol="AAPL" 
        onSymbolChange={mockOnSymbolChange}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('AAPL'));

    // Wait for dropdown to appear
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'goog' } });

    // Should show filtered results
    await waitFor(() => {
      expect(screen.getByText('Alphabet Inc. (Class A)')).toBeInTheDocument();
      expect(screen.getByText('Alphabet Inc. (Class C)')).toBeInTheDocument();
      expect(screen.queryByText('Microsoft Corporation')).not.toBeInTheDocument();
    });
  });

  it('closes the dropdown when clicking outside', async () => {
    render(
      <SymbolSelector 
        currentSymbol="AAPL" 
        onSymbolChange={mockOnSymbolChange}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('AAPL'));

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
    });

    // Click outside (on the document body)
    fireEvent.mouseDown(document.body);

    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText('Microsoft Corporation')).not.toBeInTheDocument();
    });
  });
}); 