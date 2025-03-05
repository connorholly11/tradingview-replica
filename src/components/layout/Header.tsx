'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronDown, 
  BarChart4, 
  CandlestickChart, 
  LineChart, 
  Grid3X3, 
  Settings, 
  Undo2, 
  Redo2, 
  Moon,
  Sun
} from 'lucide-react';

interface HeaderProps {
  currentSymbol: string;
  currentTimeframe: string;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  onChartTypeChange?: (type: 'candle' | 'bar' | 'line') => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

const Header = ({
  currentSymbol,
  currentTimeframe,
  onSymbolChange,
  onTimeframeChange,
  onChartTypeChange,
  onToggleTheme,
  isDarkMode = true
}: HeaderProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chartType, setChartType] = useState<'candle' | 'bar' | 'line'>('candle');
  
  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '30m', value: '30m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
  ];
  
  const popularSymbols = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'BTC-USD', name: 'Bitcoin USD' },
    { symbol: 'ETH-USD', name: 'Ethereum USD' },
  ];
  
  const handleSymbolSelect = (symbol: string) => {
    onSymbolChange(symbol);
    setSearchValue('');
    setIsSearchOpen(false);
  };
  
  const handleChartTypeChange = (type: 'candle' | 'bar' | 'line') => {
    setChartType(type);
    if (onChartTypeChange) {
      onChartTypeChange(type);
    }
  };
  
  const filteredSymbols = popularSymbols.filter(item => 
    item.symbol.toLowerCase().includes(searchValue.toLowerCase()) || 
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <header className="flex items-center h-14 px-4 border-b border-gray-700 bg-[#131722] text-gray-300">
      {/* Logo */}
      <div className="mr-6">
        <Link href="/" className="text-xl font-bold text-white">
          TradingView<span className="text-blue-500">Replica</span>
        </Link>
      </div>
      
      {/* Symbol Search */}
      <div className="relative mr-4">
        <div 
          className="flex items-center h-8 px-3 bg-[#2A2E39] rounded cursor-pointer"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <Search size={16} className="mr-2 text-gray-400" />
          <span className="font-medium">{currentSymbol}</span>
          <ChevronDown size={16} className="ml-2 text-gray-400" />
        </div>
        
        {isSearchOpen && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-[#1E222D] border border-gray-700 rounded shadow-lg z-50">
            <div className="p-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search symbol..."
                  className="w-full h-10 pl-10 pr-3 bg-[#2A2E39] text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filteredSymbols.map((item) => (
                <div
                  key={item.symbol}
                  className="px-4 py-2 hover:bg-[#2A2E39] cursor-pointer flex items-center"
                  onClick={() => handleSymbolSelect(item.symbol)}
                >
                  <div>
                    <div className="font-medium">{item.symbol}</div>
                    <div className="text-xs text-gray-400">{item.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Timeframe Selector */}
      <div className="flex space-x-1 mr-4">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            className={`px-2 py-1 text-xs rounded ${
              currentTimeframe === tf.value
                ? 'bg-blue-500 text-white'
                : 'bg-[#2A2E39] text-gray-300 hover:bg-[#363A45]'
            }`}
            onClick={() => onTimeframeChange(tf.value)}
          >
            {tf.label}
          </button>
        ))}
      </div>
      
      {/* Chart Type Selector */}
      <div className="flex space-x-1 mr-4 bg-[#2A2E39] rounded">
        <button
          className={`p-1.5 rounded-l ${chartType === 'bar' ? 'bg-[#363A45]' : ''}`}
          onClick={() => handleChartTypeChange('bar')}
          title="Bar Chart"
        >
          <BarChart4 size={16} />
        </button>
        <button
          className={`p-1.5 ${chartType === 'candle' ? 'bg-[#363A45]' : ''}`}
          onClick={() => handleChartTypeChange('candle')}
          title="Candlestick Chart"
        >
          <CandlestickChart size={16} />
        </button>
        <button
          className={`p-1.5 rounded-r ${chartType === 'line' ? 'bg-[#363A45]' : ''}`}
          onClick={() => handleChartTypeChange('line')}
          title="Line Chart"
        >
          <LineChart size={16} />
        </button>
      </div>
      
      {/* Additional Controls */}
      <div className="flex space-x-2 ml-auto">
        <button className="p-1.5 bg-[#2A2E39] rounded hover:bg-[#363A45]" title="Undo">
          <Undo2 size={16} />
        </button>
        <button className="p-1.5 bg-[#2A2E39] rounded hover:bg-[#363A45]" title="Redo">
          <Redo2 size={16} />
        </button>
        <button className="p-1.5 bg-[#2A2E39] rounded hover:bg-[#363A45]" title="Layout">
          <Grid3X3 size={16} />
        </button>
        <button className="p-1.5 bg-[#2A2E39] rounded hover:bg-[#363A45]" title="Settings">
          <Settings size={16} />
        </button>
        <button 
          className="p-1.5 bg-[#2A2E39] rounded hover:bg-[#363A45]" 
          title="Toggle Theme"
          onClick={onToggleTheme}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

export default Header; 