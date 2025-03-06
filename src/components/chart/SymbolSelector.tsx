'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Props for the SymbolSelector component
 */
interface SymbolSelectorProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

/**
 * Only BTC-USD and ETH-USD for this crypto platform
 */
const POPULAR_SYMBOLS = [
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
];

/**
 * Symbol Selector component - allows users to search and select cryptocurrency symbols
 */
export const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  currentSymbol,
  onSymbolChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter symbols based on search term
  const filteredSymbols = searchTerm
    ? POPULAR_SYMBOLS.filter(item =>
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : POPULAR_SYMBOLS;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle symbol selection
  const handleSymbolSelect = (symbol: string) => {
    onSymbolChange(symbol);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  // Get current symbol's expanded name
  const currentSymbolData = POPULAR_SYMBOLS.find(item => item.symbol === currentSymbol);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center space-x-2 text-white cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">{currentSymbol}</span>
        <span className="text-xs text-gray-400">{currentSymbolData?.name || ''}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-[#1E222D] border border-[#2A2E39] rounded shadow-lg z-10">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search symbol..."
              className="w-full px-3 py-2 bg-[#131722] border border-[#2A2E39] rounded text-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {filteredSymbols.map((item) => (
              <div
                key={item.symbol}
                className={`p-2 hover:bg-[#2A2E39] cursor-pointer ${
                  currentSymbol === item.symbol ? 'bg-[#2A2E39]' : ''
                }`}
                onClick={() => handleSymbolSelect(item.symbol)}
              >
                <div className="font-semibold text-white">{item.symbol}</div>
                <div className="text-xs text-gray-400">{item.name}</div>
              </div>
            ))}
            
            {filteredSymbols.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No cryptocurrencies found matching &ldquo;{searchTerm}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolSelector; 