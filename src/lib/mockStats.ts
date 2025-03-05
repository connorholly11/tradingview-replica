/**
 * Mock statistics data for the trader stats page
 * This serves as a placeholder until real data can be fetched from a database
 */

export interface Trade {
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  date: string;
}

export interface Stats {
  totalPnL: number;
  pnlChange: number;
  winRate: number;
  winRateChange: number;
  totalTrades: number;
  drawdown: number;
  drawdownChange: number;
  recentTrades: Trade[];
}

export const mockStats: Stats = {
  totalPnL: 3450.76,
  pnlChange: 5.2,
  winRate: 58,
  winRateChange: 3.5,
  totalTrades: 25,
  drawdown: 7.8,
  drawdownChange: -2.3,
  recentTrades: [
    {
      symbol: 'AAPL',
      side: 'BUY',
      entryPrice: 148.25,
      exitPrice: 152.37,
      pnl: 412.00,
      date: '2023-11-15'
    },
    {
      symbol: 'MSFT',
      side: 'BUY',
      entryPrice: 334.78,
      exitPrice: 339.56,
      pnl: 478.00,
      date: '2023-11-14'
    },
    {
      symbol: 'NVDA',
      side: 'SELL',
      entryPrice: 485.90,
      exitPrice: 465.30,
      pnl: 2060.00,
      date: '2023-11-13'
    },
    {
      symbol: 'TSLA',
      side: 'BUY',
      entryPrice: 215.36,
      exitPrice: 210.22,
      pnl: -514.00,
      date: '2023-11-12'
    },
    {
      symbol: 'AMZN',
      side: 'SELL',
      entryPrice: 142.75,
      exitPrice: 145.90,
      pnl: -315.00,
      date: '2023-11-10'
    }
  ]
}; 