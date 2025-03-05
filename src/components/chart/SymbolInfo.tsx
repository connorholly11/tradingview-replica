'use client';

import { useEffect, useState } from 'react';

interface SymbolInfoProps {
  symbol: string;
  lastPrice: number;
  change?: number;
  changePercent?: number;
  high?: number;
  low?: number;
  volume?: number;
  open?: number;
  previousClose?: number;
}

const SymbolInfo = ({
  symbol,
  lastPrice,
  change = 0,
  changePercent = 0,
  high,
  low,
  volume,
  open,
  previousClose,
}: SymbolInfoProps) => {
  const [symbolName, setSymbolName] = useState('');
  
  // Format the symbol name for display
  useEffect(() => {
    // Map common symbols to their full names
    const symbolMap: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corp.',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corp.',
      'BTC-USD': 'Bitcoin / USD',
      'ETH-USD': 'Ethereum / USD',
    };
    
    setSymbolName(symbolMap[symbol] || symbol);
  }, [symbol]);
  
  // Format numbers for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };
  
  const formatLargeNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toString();
  };
  
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="flex items-center h-10 px-4 border-b border-gray-700 bg-[#1E222D] text-gray-300 text-sm">
      <div className="flex items-center space-x-4">
        {/* Symbol and Name */}
        <div>
          <span className="font-bold text-white">{symbol}</span>
          <span className="ml-2 text-gray-400">{symbolName}</span>
        </div>
        
        {/* Price */}
        <div className="font-bold text-white">
          {formatPrice(lastPrice)}
        </div>
        
        {/* Change */}
        <div className={`flex items-center ${changeColor}`}>
          <span>{isPositive ? '+' : ''}{formatPrice(change)}</span>
          <span className="ml-1">({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
        </div>
        
        {/* Additional Info */}
        {high !== undefined && low !== undefined && (
          <div className="text-gray-400">
            <span className="mr-1">H</span>
            <span className="text-white">{formatPrice(high)}</span>
            <span className="mx-1">L</span>
            <span className="text-white">{formatPrice(low)}</span>
          </div>
        )}
        
        {volume !== undefined && (
          <div className="text-gray-400">
            <span className="mr-1">Vol</span>
            <span className="text-white">{formatLargeNumber(volume)}</span>
          </div>
        )}
        
        {/* Open and Previous Close */}
        {open !== undefined && (
          <div className="text-gray-400">
            <span className="mr-1">O</span>
            <span className="text-white">{formatPrice(open)}</span>
          </div>
        )}
        
        {previousClose !== undefined && (
          <div className="text-gray-400">
            <span className="mr-1">PC</span>
            <span className="text-white">{formatPrice(previousClose)}</span>
          </div>
        )}
      </div>
      
      {/* Buy/Sell Buttons */}
      <div className="ml-auto flex space-x-2">
        <button className="px-4 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700">
          BUY
        </button>
        <button className="px-4 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">
          SELL
        </button>
      </div>
    </div>
  );
};

export default SymbolInfo; 