import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsPage from '@/app/stats/page';
import { mockStats } from '@/lib/mockStats';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/stats'),
}));

describe('Stats Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the stats page with mock data', () => {
    render(<StatsPage />);
    
    // Check for the page title
    expect(screen.getByText('Trading Statistics')).toBeInTheDocument();
    
    // Check for the stat cards
    expect(screen.getByText('Total P&L')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Total Trades')).toBeInTheDocument();
    expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
    
    // Check that the actual mock values are displayed
    expect(screen.getByText(`$${mockStats.totalPnL.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`${mockStats.winRate}%`)).toBeInTheDocument();
    expect(screen.getByText(mockStats.totalTrades.toString())).toBeInTheDocument();
    expect(screen.getByText(`${mockStats.drawdown}%`)).toBeInTheDocument();
    
    // Check for the recent trades table
    expect(screen.getByText('Recent Trades')).toBeInTheDocument();
    
    // Check that the AppTabs component is included
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    
    // Get all table rows in the trades table (excluding the header row)
    const tableRows = screen.getAllByRole('row').slice(1); // Skip header row
    
    // Verify that the recent trades are displayed by checking each row
    mockStats.recentTrades.forEach((trade, index) => {
      const row = tableRows[index];
      
      // Use within to scope queries to just this row
      expect(within(row).getByText(trade.symbol)).toBeInTheDocument();
      expect(within(row).getByText(trade.side)).toBeInTheDocument();
      expect(within(row).getByText(`$${trade.entryPrice.toFixed(2)}`)).toBeInTheDocument();
      expect(within(row).getByText(`$${trade.exitPrice.toFixed(2)}`)).toBeInTheDocument();
      expect(within(row).getByText(`$${trade.pnl.toFixed(2)}`)).toBeInTheDocument();
      expect(within(row).getByText(trade.date)).toBeInTheDocument();
    });
  });
  
  it('shows equity chart with placeholder content', () => {
    render(<StatsPage />);
    
    // Check that the equity chart placeholder is rendered
    expect(screen.getByText('Equity Curve')).toBeInTheDocument();
    expect(screen.getByText('Equity chart will appear here')).toBeInTheDocument();
  });
}); 