'use client';

interface TimeframeSelectorProps {
  currentTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

// Valid Coinbase timeframes
const TIMEFRAMES = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '1D', label: '1D' },
];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  currentTimeframe,
  onTimeframeChange,
}) => {
  return (
    <div className="flex space-x-1">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe.value}
          className={`px-2 py-1 text-xs rounded ${
            currentTimeframe === timeframe.value
              ? 'bg-blue-500 text-white'
              : 'bg-[#2A2E39] text-gray-300 hover:bg-[#3A3E49]'
          }`}
          onClick={() => onTimeframeChange(timeframe.value)}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;
