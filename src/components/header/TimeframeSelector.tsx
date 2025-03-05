'use client';

/**
 * Logger function for timeframe selector interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logTimeframeSelector = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[TimeframeSelector ${timestamp}]`, action, details || '');
};

/**
 * Available timeframes for chart viewing
 */
const TIMEFRAMES = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' }
];

interface TimeframeSelectorProps {
  onTimeframeChange: (timeframe: string) => void;
  selectedTimeframe: string;
}

const TimeframeSelector = ({ onTimeframeChange, selectedTimeframe = '1D' }: TimeframeSelectorProps) => {
  const handleSelectTimeframe = (timeframe: string) => {
    logTimeframeSelector('Timeframe Selected', { timeframe });
    onTimeframeChange(timeframe);
  };

  return (
    <div className="relative">
      <div className="flex space-x-1">
        {TIMEFRAMES.map((timeframe) => (
          <button
            key={timeframe.value}
            className={`px-2 py-1 text-sm rounded ${
              selectedTimeframe === timeframe.value
                ? 'bg-blue-500 text-white'
                : 'bg-[#2A2E39] text-gray-300 hover:bg-[#363A45]'
            }`}
            onClick={() => handleSelectTimeframe(timeframe.value)}
          >
            {timeframe.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeframeSelector; 