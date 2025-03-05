'use client';

import { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPercent } from 'react-icons/fi';
import AppTabs from '@/components/layout/AppTabs';
import { mockStats } from '@/lib/mockStats';

/**
 * Logger function for stats page interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logStats = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[Stats ${timestamp}]`, action, details || '');
};

/**
 * StatCard component for displaying individual statistics
 */
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, isPositive, icon }: StatCardProps) {
  return (
    <div className="bg-[#2A2E39] rounded-lg p-5 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className="p-2 bg-[#1E222D] rounded-md text-blue-400">{icon}</div>
      </div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      {change && (
        <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
          {isPositive ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
          {change}
        </div>
      )}
    </div>
  );
}

/**
 * EquityChart component (placeholder)
 * In the future, this would be a real chart showing equity curve
 */
function EquityChart() {
  return (
    <div className="bg-[#2A2E39] rounded-lg p-5 h-64">
      <h3 className="text-lg font-semibold mb-4">Equity Curve</h3>
      <div className="flex h-44 items-center justify-center bg-[#1E222D] rounded-md">
        <p className="text-gray-400">Equity chart will appear here</p>
      </div>
    </div>
  );
}

/**
 * TradeHistoryTable component (placeholder)
 * In the future, this would show real trade history from a database
 */
function TradeHistoryTable() {
  return (
    <div className="bg-[#2A2E39] rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
      <table className="w-full">
        <thead>
          <tr className="text-gray-400 text-left">
            <th className="pb-3">Symbol</th>
            <th className="pb-3">Side</th>
            <th className="pb-3">Entry Price</th>
            <th className="pb-3">Exit Price</th>
            <th className="pb-3">P&L</th>
            <th className="pb-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {mockStats.recentTrades.map((trade, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="py-3">{trade.symbol}</td>
              <td className={`py-3 ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                {trade.side}
              </td>
              <td className="py-3">${trade.entryPrice.toFixed(2)}</td>
              <td className="py-3">${trade.exitPrice.toFixed(2)}</td>
              <td className={`py-3 ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${trade.pnl.toFixed(2)}
              </td>
              <td className="py-3 text-gray-400">{trade.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * StatsPage component that displays trading statistics
 * Currently using mock data, but designed to be easily connected to real data in the future
 */
export default function StatsPage() {
  // In the future, this would load data from an API or database
  // For now, it uses mock data
  
  // Log page view
  logStats('Page Viewed', { userId: 'mock-user-id' });
  
  return (
    <div className="flex flex-col min-h-screen bg-[#1E222D] text-white">
      {/* Navigation Tabs */}
      <AppTabs />
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Trading Statistics</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Total P&L" 
            value={`$${mockStats.totalPnL.toFixed(2)}`} 
            change={`${mockStats.pnlChange > 0 ? '+' : ''}${mockStats.pnlChange.toFixed(2)}%`} 
            isPositive={mockStats.pnlChange > 0}
            icon={<FiDollarSign />}
          />
          <StatCard 
            title="Win Rate" 
            value={`${mockStats.winRate}%`} 
            change={`${mockStats.winRateChange > 0 ? '+' : ''}${mockStats.winRateChange.toFixed(2)}%`} 
            isPositive={mockStats.winRateChange > 0}
            icon={<FiPercent />}
          />
          <StatCard 
            title="Total Trades" 
            value={mockStats.totalTrades} 
            icon={<FiTrendingUp />}
          />
          <StatCard 
            title="Max Drawdown" 
            value={`${mockStats.drawdown}%`} 
            change={`${mockStats.drawdownChange > 0 ? '+' : ''}${mockStats.drawdownChange.toFixed(2)}%`} 
            isPositive={mockStats.drawdownChange <= 0}
            icon={<FiTrendingDown />}
          />
        </div>
        
        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquityChart />
          <TradeHistoryTable />
        </div>
      </main>
    </div>
  );
} 