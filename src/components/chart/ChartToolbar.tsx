'use client';

import { useState } from 'react';
import SymbolSelector from './SymbolSelector';
import TimeframeSelector from './TimeframeSelector';
import Indicators from './Indicators';

interface IndicatorConfig {
  id: string;
  type: string;
  name: string;
  color: string;
  visible: boolean;
  settings: Record<string, number>;
}

interface ChartToolbarProps {
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  onAddIndicator?: (indicator: IndicatorConfig) => void;
  onRemoveIndicator?: (id: string) => void;
  onUpdateIndicator?: (id: string, updates: Partial<IndicatorConfig>) => void;
  initialSymbol?: string;
  initialTimeframe?: string;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  onSymbolChange,
  onTimeframeChange,
  onAddIndicator = () => {},
  onRemoveIndicator = () => {},
  onUpdateIndicator = () => {},
  initialSymbol = 'AAPL',
  initialTimeframe = '1D',
}) => {
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);
  const [currentTimeframe, setCurrentTimeframe] = useState(initialTimeframe);
  
  const handleSymbolChange = (symbol: string) => {
    setCurrentSymbol(symbol);
    onSymbolChange(symbol);
  };
  
  const handleTimeframeChange = (timeframe: string) => {
    setCurrentTimeframe(timeframe);
    onTimeframeChange(timeframe);
  };
  
  return (
    <div className="flex items-center justify-between p-2 border-b border-[#2A2E39]">
      <div className="flex-1">
        <SymbolSelector 
          currentSymbol={currentSymbol} 
          onSymbolChange={handleSymbolChange} 
        />
      </div>
      
      <div className="flex items-center space-x-3">
        <TimeframeSelector 
          currentTimeframe={currentTimeframe} 
          onTimeframeChange={handleTimeframeChange} 
        />
        
        <Indicators
          onAddIndicator={onAddIndicator}
          onRemoveIndicator={onRemoveIndicator}
          onUpdateIndicator={onUpdateIndicator}
        />
      </div>
    </div>
  );
};

export default ChartToolbar; 