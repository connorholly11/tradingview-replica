'use client';

import React from 'react';
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
  onTimeframeChange: (timeframe: string) => void;
  onAddIndicator?: (indicator: IndicatorConfig) => void;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<IndicatorConfig>) => void;
  initialTimeframe?: string;
}

export default function ChartToolbar({
  onTimeframeChange,
  onAddIndicator = () => {},
  onRemove = () => {},
  onUpdate = () => {},
  initialTimeframe = '1D'
}: ChartToolbarProps) {
  const [currentTimeframe, setCurrentTimeframe] = React.useState(initialTimeframe);

  const handleTimeframeChange = (tf: string) => {
    setCurrentTimeframe(tf);
    onTimeframeChange(tf);
  };

  return (
    <div className="flex items-center justify-between p-2 border-b border-[#2A2E39]">
      {/* The symbol selector is removed. We'll just show timeframe and indicators. */}

      <div className="flex items-center space-x-3">
        <TimeframeSelector 
          currentTimeframe={currentTimeframe} 
          onTimeframeChange={handleTimeframeChange}
        />

        <Indicators
          onAddIndicator={onAddIndicator}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
