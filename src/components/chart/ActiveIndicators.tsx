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
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<IndicatorConfig>) => void;
}

export default function ActiveIndicators({
  indicators,
  onRemove,
  onUpdate
}: ActiveIndicatorsProps) {
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);

  if (indicators.length === 0) {
    return null;
  }

  const toggleVisibility = (id: string, currentVisibility: boolean) => {
    onUpdate(id, { visible: !currentVisibility });
  };

  const toggleExpand = (id: string) => {
    setExpandedIndicator(expandedIndicator === id ? null : id);
  };

  const updateSetting = (id: string, setting: string, value: number) => {
    const ind = indicators.find(i => i.id === id);
    if (!ind) return;
    const updatedSettings = { ...ind.settings, [setting]: value };
    onUpdate(id, { settings: updatedSettings });
  };

  return (
    <div className="bg-[#2A2E39] border-t border-gray-700 p-2">
      <h3 className="text-gray-300 text-sm font-semibold mb-2">Active Indicators</h3>

      <div className="space-y-2">
        {indicators.map((indicator) => (
          <div key={indicator.id} className="bg-[#1E222D] rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: indicator.color }}
                />
                <span className="text-sm">{indicator.name}</span>
              </div>

              <div className="flex items-center">
                {/* Visibility Toggle */}
                <button
                  onClick={() => toggleVisibility(indicator.id, indicator.visible)}
                  className="text-gray-400 hover:text-white p-1"
                  title={indicator.visible ? 'Hide indicator' : 'Show indicator'}
                >
                  {indicator.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                </button>

                {/* Settings / Edit */}
                <button
                  onClick={() => toggleExpand(indicator.id)}
                  className="text-gray-400 hover:text-white p-1"
                  title="Edit Settings"
                >
                  <FiSettings size={14} />
                </button>

                {/* Remove */}
                <button
                  onClick={() => onRemove(indicator.id)}
                  className="text-gray-400 hover:text-red-400 p-1"
                  title="Remove indicator"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>

            {/* Expanded Settings */}
            {expandedIndicator === indicator.id && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                {Object.entries(indicator.settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between mb-1">
                    <label className="text-gray-400 text-xs">{key}:</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        className="bg-[#131722] text-white text-xs w-16 p-1 rounded"
                        value={value}
                        onChange={(e) => updateSetting(
                          indicator.id,
                          key,
                          parseFloat(e.target.value) || 0
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between mt-2">
                  <label className="text-gray-400 text-xs">Color:</label>
                  <input
                    type="color"
                    className="w-8 h-8 rounded cursor-pointer"
                    value={indicator.color}
                    onChange={(e) => onUpdate(indicator.id, { color: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
