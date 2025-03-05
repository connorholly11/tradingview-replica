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
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<IndicatorConfig>) => void;
}

export default function Indicators({
  onAddIndicator,
  onRemove,
  onUpdate
}: IndicatorsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [search, setSearch] = useState('');

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

  const filtered = search
    ? indicators.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      )
    : indicators;

  const handleAddIndicator = (ind: IndicatorDefinition) => {
    const id = `${ind.type}_${Date.now()}`;
    onAddIndicator({
      id,
      type: ind.type,
      name: ind.name,
      color: ind.defaultColor,
      visible: true,
      settings: ind.defaultSettings
    });
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center px-3 py-1 bg-[#2A2E39] hover:bg-[#363c4e] rounded text-sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        <FiPlus className="mr-2" />
        <span>Add Indicator</span>
      </button>

      {showMenu && (
        <div className="absolute top-10 right-0 bg-[#131722] border border-[#2A2E39] rounded shadow-lg z-10 w-64">
          <div className="p-2 border-b border-[#2A2E39]">
            <h3 className="text-sm font-medium mb-2">Select Indicator</h3>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 rounded bg-[#2A2E39] text-white text-sm"
            />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filtered.map((indicator) => (
              <div
                key={indicator.type}
                className="px-3 py-2 hover:bg-[#2A2E39] cursor-pointer flex justify-between items-center"
                onClick={() => handleAddIndicator(indicator)}
              >
                <span className="text-sm">{indicator.name}</span>
                <span className="text-xs text-gray-400">+</span>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No indicators found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
