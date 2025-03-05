'use client';

/**
 * Logger function for chart type selector interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logChartTypeSelector = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[ChartTypeSelector ${timestamp}]`, action, details || '');
};

interface ChartTypeSelectorProps {
  onChartTypeChange: (type: 'candle' | 'bar' | 'line') => void;
  selectedChartType: 'candle' | 'bar' | 'line';
}

const ChartTypeSelector = ({ 
  onChartTypeChange, 
  selectedChartType = 'candle'
}: ChartTypeSelectorProps) => {
  
  const handleTypeChange = (type: 'candle' | 'bar' | 'line') => {
    logChartTypeSelector('Chart Type Changed', { from: selectedChartType, to: type });
    onChartTypeChange(type);
  };
  
  return (
    <div className="flex bg-[#2A2E39] rounded overflow-hidden">
      <button
        className={`px-3 py-1 text-sm ${
          selectedChartType === 'candle' 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-300 hover:bg-[#363A45]'
        }`}
        onClick={() => handleTypeChange('candle')}
        title="Candlestick Chart"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9" y="6" width="6" height="12" rx="1" fill="currentColor" />
          <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      
      <button
        className={`px-3 py-1 text-sm ${
          selectedChartType === 'bar' 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-300 hover:bg-[#363A45]'
        }`}
        onClick={() => handleTypeChange('bar')}
        title="Bar Chart"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="5" y1="12" x2="5" y2="19" stroke="currentColor" strokeWidth="2" />
          <line x1="5" y1="5" x2="5" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="9" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="5" x2="12" y2="9" stroke="currentColor" strokeWidth="2" />
          <line x1="19" y1="15" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
          <line x1="19" y1="5" x2="19" y2="15" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      
      <button
        className={`px-3 py-1 text-sm ${
          selectedChartType === 'line' 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-300 hover:bg-[#363A45]'
        }`}
        onClick={() => handleTypeChange('line')}
        title="Line Chart"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default ChartTypeSelector; 