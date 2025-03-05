'use client';

import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

type IndicatorType = 
  | 'sma' 
  | 'ema' 
  | 'rsi' 
  | 'macd' 
  | 'bollingerBands' 
  | 'stochasticRSI' 
  | 'volume';

interface IndicatorSettings {
  [key: string]: number;
}

interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  name: string;
  color: string;
  visible: boolean;
  settings: IndicatorSettings;
}

interface IndicatorDefinition {
  type: IndicatorType;
  name: string;
  defaultSettings: IndicatorSettings;
  defaultColor: string;
}

interface IndicatorsProps {
  onAddIndicator: (indicator: IndicatorConfig) => void;
  onRemoveIndicator: (id: string) => void;
  onUpdateIndicator: (id: string, updates: Partial<IndicatorConfig>) => void;
}

export const Indicators: React.FC<IndicatorsProps> = ({
  onAddIndicator
  // We're not using these props yet, but will in future implementations
  // onRemoveIndicator,
  // onUpdateIndicator
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const indicators: IndicatorDefinition[] = [
    { 
      type: 'sma', 
      name: 'Simple Moving Average', 
      defaultSettings: { period: 20 },
      defaultColor: '#2962FF'
    },
    { 
      type: 'ema', 
      name: 'Exponential Moving Average', 
      defaultSettings: { period: 20 },
      defaultColor: '#FF6D00'
    },
    { 
      type: 'rsi', 
      name: 'Relative Strength Index', 
      defaultSettings: { period: 14, overbought: 70, oversold: 30 },
      defaultColor: '#B71C1C'
    },
    { 
      type: 'macd', 
      name: 'MACD', 
      defaultSettings: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      defaultColor: '#00B0FF'
    },
    { 
      type: 'bollingerBands', 
      name: 'Bollinger Bands', 
      defaultSettings: { period: 20, stdDev: 2 },
      defaultColor: '#00C853'
    },
    { 
      type: 'stochasticRSI', 
      name: 'Stochastic RSI', 
      defaultSettings: { rsiPeriod: 14, stochasticPeriod: 14, kPeriod: 3, dPeriod: 3 },
      defaultColor: '#8E24AA'
    },
    { 
      type: 'volume', 
      name: 'Volume', 
      defaultSettings: { multiplier: 1 },
      defaultColor: '#757575'
    }
  ];

  const handleAddIndicator = (indicator: IndicatorDefinition) => {
    const id = `${indicator.type}_${Date.now()}`;
    onAddIndicator({
      id,
      type: indicator.type,
      name: indicator.name,
      color: indicator.defaultColor,
      visible: true,
      settings: indicator.defaultSettings
    });
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center px-3 py-1 bg-[#2A2E39] hover:bg-[#363c4e] rounded text-sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        <span>Indicators</span>
      </button>
      
      {showMenu && (
        <div className="absolute top-10 right-0 bg-[#131722] border border-[#2A2E39] rounded shadow-lg z-10 w-64">
          <div className="p-2 border-b border-[#2A2E39]">
            <h3 className="text-sm font-medium">Add Indicator</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {indicators.map((indicator) => (
              <div 
                key={indicator.type}
                className="px-3 py-2 hover:bg-[#2A2E39] cursor-pointer flex justify-between items-center"
                onClick={() => handleAddIndicator(indicator)}
              >
                <span className="text-sm">{indicator.name}</span>
                <span className="text-xs text-gray-400">+</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Indicators; 