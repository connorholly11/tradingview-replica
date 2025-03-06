'use client';

/**
 * Logger function for timeframe selector interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logTimeframeSelector = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[TimeframeSelector ${timestamp}]`, action, details || {});
};

/**
 * Available timeframes for chart viewing (Coinbase only allows certain intervals).
 * We remove 30m, 4h. We add 6h to match Coinbase's 21600 granularity.
 */
const TIMEFRAMES = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '1D', label: '1D' },
];

interface TimeframeSelectorProps {
  onTimeframeChange: (timeframe: string) => void;
  selectedTimeframe: string;
}

export default function TimeframeSelector({
  onTimeframeChange,
  selectedTimeframe = '1D',
}: TimeframeSelectorProps) {
  const handleSelectTimeframe = (timeframe: string) => {
    logTimeframeSelector('Timeframe Selected', { timeframe });
    onTimeframeChange(timeframe);
  };

  return (
    <div className="relative">
      <div className="flex space-x-0.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors duration-150 ${
              selectedTimeframe === tf.value
                ? 'bg-[#2962FF] text-white'
                : 'bg-transparent text-gray-300 hover:bg-[#2A2E39] hover:text-white'
            }`}
            onClick={() => handleSelectTimeframe(tf.value)}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
