'use client';

import React, { useState } from 'react';
import { FiX, FiSettings, FiEye, FiEyeOff } from 'react-icons/fi';

interface IndicatorSettings {
  [key: string]: number;
}

interface IndicatorConfig {
  id: string;
  type: string;
  name: string;
  color: string;
  visible: boolean;
  settings: IndicatorSettings;
}

interface ActiveIndicatorsProps {
  indicators: IndicatorConfig[];
  onRemoveIndicator: (id: string) => void;
  onUpdateIndicator: (id: string, updates: Partial<IndicatorConfig>) => void;
}

export const ActiveIndicators: React.FC<ActiveIndicatorsProps> = ({
  indicators,
  onRemoveIndicator,
  onUpdateIndicator
}) => {
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  
  if (indicators.length === 0) {
    return null;
  }
  
  const toggleVisibility = (id: string, currentVisibility: boolean) => {
    onUpdateIndicator(id, { visible: !currentVisibility });
  };
  
  const toggleExpand = (id: string) => {
    setExpandedIndicator(expandedIndicator === id ? null : id);
  };
  
  const updateSetting = (id: string, setting: string, value: number) => {
    const indicator = indicators.find(ind => ind.id === id);
    if (indicator) {
      const newSettings = { ...indicator.settings, [setting]: value };
      onUpdateIndicator(id, { settings: newSettings });
    }
  };
  
  return (
    <div className="bg-[#131722] border border-[#2A2E39] rounded shadow-lg p-2 max-w-sm">
      <h3 className="text-sm font-medium mb-2">Active Indicators</h3>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {indicators.map((indicator) => (
          <div 
            key={indicator.id} 
            className="border border-[#2A2E39] rounded p-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: indicator.color }}
                />
                <span className="text-sm">{indicator.name}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button 
                  className="p-1 text-gray-400 hover:text-white"
                  onClick={() => toggleVisibility(indicator.id, indicator.visible)}
                >
                  {indicator.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-white"
                  onClick={() => toggleExpand(indicator.id)}
                >
                  <FiSettings size={14} />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-white"
                  onClick={() => onRemoveIndicator(indicator.id)}
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>
            
            {expandedIndicator === indicator.id && (
              <div className="mt-2 pt-2 border-t border-[#2A2E39]">
                <div className="space-y-2">
                  {Object.entries(indicator.settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-xs capitalize">{key}</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          className="w-16 px-1 py-0.5 text-xs bg-[#2A2E39] border border-[#363c4e] rounded"
                          value={value}
                          onChange={(e) => updateSetting(
                            indicator.id, 
                            key, 
                            e.target.value === '' ? 0 : Number(e.target.value)
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between">
                    <label className="text-xs">Color</label>
                    <input
                      type="color"
                      className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                      value={indicator.color}
                      onChange={(e) => onUpdateIndicator(indicator.id, { color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveIndicators; 