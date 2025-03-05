'use client';

import { useState, useRef } from 'react';
import ChartContainer from '@/components/chart/ChartContainer';
import Header from '@/components/header/Header';
import SymbolInfo from '@/components/chart/SymbolInfo';
import { FiSettings, FiMaximize, FiGrid, FiPenTool } from 'react-icons/fi';

interface ChartContainerRef {
  toggleDrawingTools: () => void;
}

/**
 * Logger function for page-level interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logPage = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[Page ${timestamp}]`, action, details || '');
};

export default function Home() {
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [currentTimeframe, setCurrentTimeframe] = useState('1D');
  const [chartType, setChartType] = useState<'candle' | 'bar' | 'line'>('candle');
  const [symbolData, setSymbolData] = useState({
    lastPrice: 149.26,
    change: 2.35,
    changePercent: 1.58,
    high: 149.87,
    low: 147.90,
    volume: 63400000,
    open: 148.35,
    previousClose: 146.91
  });
  
  const chartContainerRef = useRef<ChartContainerRef>(null);

  const toggleDrawingTools = () => {
    logPage('Toggle Drawing Tools', { showDrawingTools: !showDrawingTools });
    setShowDrawingTools(!showDrawingTools);
    
    // If we have a reference to the chart container, toggle its drawing tools
    if (chartContainerRef.current) {
      chartContainerRef.current.toggleDrawingTools();
    }
  };
  
  const handleSymbolChange = (symbol: string) => {
    logPage('Symbol Changed', { from: currentSymbol, to: symbol });
    setCurrentSymbol(symbol);
    
    // In a real app, we would fetch the latest data for this symbol
    // For now, we'll just simulate different data
    const randomChange = (Math.random() * 5 - 2.5).toFixed(2);
    const changeValue = parseFloat(randomChange);
    const lastPrice = Math.max(50, Math.random() * 500).toFixed(2);
    const price = parseFloat(lastPrice);
    const changePercent = (changeValue / price * 100).toFixed(2);
    
    const newSymbolData = {
      lastPrice: price,
      change: changeValue,
      changePercent: parseFloat(changePercent),
      high: price * (1 + Math.random() * 0.02),
      low: price * (1 - Math.random() * 0.02),
      volume: Math.floor(Math.random() * 100000000),
      open: price * (1 - Math.random() * 0.01),
      previousClose: price * (1 - Math.random() * 0.02)
    };
    
    logPage('Symbol Data Updated', { symbol, data: newSymbolData });
    setSymbolData(newSymbolData);
  };
  
  const handleTimeframeChange = (timeframe: string) => {
    logPage('Timeframe Changed', { from: currentTimeframe, to: timeframe });
    setCurrentTimeframe(timeframe);
  };
  
  const handleChartTypeChange = (type: 'candle' | 'bar' | 'line') => {
    logPage('Chart Type Changed', { from: chartType, to: type });
    setChartType(type);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#1E222D] text-white">
      {/* Header */}
      <Header 
        onSymbolChange={handleSymbolChange}
        onTimeframeChange={handleTimeframeChange}
        onChartTypeChange={handleChartTypeChange}
        initialSymbol={currentSymbol}
        initialTimeframe={currentTimeframe}
        initialChartType={chartType}
        toggleDrawingTools={toggleDrawingTools}
      />
      
      {/* Symbol Info Bar */}
      <SymbolInfo 
        symbol={currentSymbol}
        lastPrice={symbolData.lastPrice}
        change={symbolData.change}
        changePercent={symbolData.changePercent}
        high={symbolData.high}
        low={symbolData.low}
        volume={symbolData.volume}
        open={symbolData.open}
        previousClose={symbolData.previousClose}
      />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col">
          {/* Chart Canvas */}
          <div className="flex-1 bg-[#131722] relative">
            <ChartContainer 
              ref={chartContainerRef} 
              symbol={currentSymbol}
              interval={currentTimeframe}
              chartType={chartType}
            />
            
            {/* Drawing Tools Toggle Button */}
            <button 
              className={`absolute top-4 left-4 p-2 rounded ${showDrawingTools ? 'bg-blue-500' : 'bg-[#2A2E39]'}`}
              onClick={toggleDrawingTools}
              title="Toggle Drawing Tools"
            >
              <FiPenTool size={16} />
            </button>
          </div>

          {/* Bottom Panel - Optional (collapsed by default) */}
          <div className="h-8 border-t border-[#2A2E39] flex items-center px-4">
            <div className="flex items-center space-x-4">
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => logPage('Grid Button Clicked')}
              >
                <FiGrid size={16} />
              </button>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => logPage('Maximize Button Clicked')}
              >
                <FiMaximize size={16} />
              </button>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => logPage('Settings Button Clicked')}
              >
                <FiSettings size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
