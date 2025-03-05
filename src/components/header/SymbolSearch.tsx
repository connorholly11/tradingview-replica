'use client';

import { useState, useEffect, useRef } from 'react';
import { popularSymbols } from '@/lib/apiService';

/**
 * Logger function for symbol search interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logSymbolSearch = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[SymbolSearch ${timestamp}]`, action, details || '');
};

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string) => void;
  initialSymbol?: string;
}

const SymbolSearch = ({ onSymbolSelect, initialSymbol = 'AAPL' }: SymbolSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter symbols as the user types
  useEffect(() => {
    if (searchQuery) {
      const filtered = popularSymbols.filter((sym: string) => 
        sym.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      
      logSymbolSearch('Search Query Updated', { 
        query: searchQuery, 
        resultsCount: filtered.length 
      });
      
      setFilteredSymbols(filtered);
      setIsDropdownOpen(true);
    } else {
      setFilteredSymbols([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectSymbol = (symbol: string) => {
    logSymbolSearch('Symbol Selected', { symbol });
    setSearchQuery('');
    setIsDropdownOpen(false);
    onSymbolSelect(symbol);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center">
        <div className="bg-[#2A2E39] text-white rounded-md px-3 py-1 flex items-center">
          <span className="font-bold mr-2">{initialSymbol}</span>
          <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="relative ml-2">
          <input
            type="text"
            placeholder="Search Symbol..."
            value={searchQuery}
            onChange={(e) => {
              logSymbolSearch('Search Input Changed', { value: e.target.value });
              setSearchQuery(e.target.value);
            }}
            className="bg-[#2A2E39] text-white rounded-md px-3 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onFocus={() => {
              logSymbolSearch('Search Input Focused');
              if (searchQuery) setIsDropdownOpen(true);
            }}
          />
          {isDropdownOpen && filteredSymbols.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-[#2A2E39] text-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredSymbols.map((symbol) => (
                <div
                  key={symbol}
                  className="px-3 py-2 hover:bg-[#363A45] cursor-pointer"
                  onClick={() => handleSelectSymbol(symbol)}
                >
                  {symbol}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymbolSearch; 