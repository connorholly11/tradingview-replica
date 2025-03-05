'use client';

import { useState } from 'react';
import SymbolSearch from './SymbolSearch';
import TimeframeSelector from './TimeframeSelector';
import ChartTypeSelector from './ChartTypeSelector';
import ThemeToggle from './ThemeToggle';

/**
 * Logger function for header interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logHeader = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[Header ${timestamp}]`, action, details || '');
};

interface HeaderProps {
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  onChartTypeChange: (type: 'candle' | 'bar' | 'line') => void;
  initialSymbol?: string;
  initialTimeframe?: string;
  initialChartType?: 'candle' | 'bar' | 'line';
  toggleDrawingTools: () => void;
}

const Header = ({
  onSymbolChange,
  onTimeframeChange,
  onChartTypeChange,
  initialSymbol = 'AAPL',
  initialTimeframe = '1D',
  initialChartType = 'candle',
  toggleDrawingTools
}: HeaderProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialTimeframe);
  const [selectedChartType, setSelectedChartType] = useState(initialChartType);

  const handleSymbolChange = (symbol: string) => {
    logHeader('Symbol Changed', { from: selectedSymbol, to: symbol });
    setSelectedSymbol(symbol);
    onSymbolChange(symbol);
  };

  const handleTimeframeChange = (timeframe: string) => {
    logHeader('Timeframe Changed', { from: selectedTimeframe, to: timeframe });
    setSelectedTimeframe(timeframe);
    onTimeframeChange(timeframe);
  };

  const handleChartTypeChange = (type: 'candle' | 'bar' | 'line') => {
    logHeader('Chart Type Changed', { from: selectedChartType, to: type });
    setSelectedChartType(type);
    onChartTypeChange(type);
  };

  const handleDrawingToolsToggle = () => {
    logHeader('Drawing Tools Toggled');
    toggleDrawingTools();
  };

  return (
    <div className="bg-[#1E222D] text-white p-2 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold mr-4">
          <span className="text-blue-500">Trading</span>
          <span>View</span>
        </div>
        
        <SymbolSearch 
          onSymbolSelect={handleSymbolChange} 
          initialSymbol={selectedSymbol} 
        />
        
        <TimeframeSelector 
          onTimeframeChange={handleTimeframeChange}
          selectedTimeframe={selectedTimeframe}
        />
        
        <ChartTypeSelector 
          onChartTypeChange={handleChartTypeChange}
          selectedChartType={selectedChartType}
        />
        
        <button 
          onClick={handleDrawingToolsToggle}
          className="px-3 py-1 bg-[#2A2E39] hover:bg-[#363A45] rounded flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.6 13.4L18 9l-4.4-4.4L9 9l4.6 4.4zM2 18l4.5-1.5L3 13l-1 5z"></path>
          </svg>
          Draw
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header; 