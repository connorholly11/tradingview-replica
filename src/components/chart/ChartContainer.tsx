'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Chart from './Chart';
import ChartToolbar from './ChartToolbar';
import ActiveIndicators from './ActiveIndicators';
import DrawingToolbar from './DrawingToolbar';
import {
  ChartData,
  fetchAggregatesUnified
} from '@/lib/apiService';
import { useRealtimePriceData } from '@/hooks/useRealtimePriceData';

interface IndicatorConfig {
  id: string;
  type: string;
  name: string;
  color: string;
  visible: boolean;
  settings: Record<string, number>;
}

interface ChartContainerProps {
  symbol?: string;
  interval?: string;
  chartType?: 'candle' | 'bar' | 'line';
  dataProvider?: 'polygon' | 'coinbase'; // optional
}

const logChart = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[ChartContainer ${timestamp}]`, action, details || '');
};

const ChartContainer = forwardRef<
  { toggleDrawingTools: () => void },
  ChartContainerProps
>(function ChartContainerComponent(
  {
    symbol = 'AAPL',
    interval = '1D',
    chartType = 'candle',
    dataProvider = 'coinbase'
  },
  ref
) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [currentChartType, setCurrentChartType] = useState(chartType);
  const [activeIndicators, setActiveIndicators] = useState<IndicatorConfig[]>([]);
  const [showDrawingTools, setShowDrawingTools] = useState(false);

  const dataInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  useImperativeHandle(ref, () => ({
    toggleDrawingTools: () => {
      logChart('Toggle Drawing Tools', { showDrawingTools: !showDrawingTools });
      setShowDrawingTools(!showDrawingTools);
    }
  }));

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Real-time updates
  const handleRealtimeUpdate = useCallback((updatedData: ChartData[]) => {
    if (dataInitializedRef.current && isMountedRef.current) {
      setChartData(updatedData);
    }
  }, []);

  const { 
    data: realtimeData, 
    isConnected, 
    error: realtimeError, 
    usingFallback 
  } = useRealtimePriceData(
    currentSymbol,
    {
      initialData: chartData,
      onUpdate: handleRealtimeUpdate,
      dataSource: 'coinbase'
    }
  );

  // For debug logging purposes
  useEffect(() => {
    if (realtimeData.length > 0) {
      logChart('Received realtime data update', { 
        lastPrice: realtimeData[realtimeData.length - 1].close,
        timestamp: new Date().toISOString()
      });
    }
  }, [realtimeData]);

  // fetch historical data
  useEffect(() => {
    if (!isMountedRef.current) return;

    logChart('Fetching historical data', { symbol: currentSymbol, interval: currentInterval });
    setIsLoading(true);
    setError(null);
    setWarning(null);

    (async () => {
      try {
        const result = await fetchAggregatesUnified(currentSymbol, currentInterval, dataProvider);
        if (!isMountedRef.current) return;

        setChartData(result.data);
        dataInitializedRef.current = true;
        if (result.warning) {
          setWarning(result.warning);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        const msg = err instanceof Error ? err.message : 'Failed to fetch data';
        logChart('Error fetching data', { msg });
        setError(msg);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    })();
  }, [currentSymbol, currentInterval, dataProvider]);

  useEffect(() => {
    if (realtimeError) {
      setError(realtimeError);
    }
  }, [realtimeError]);

  // If symbol/interval/chartType props change
  useEffect(() => {
    if (symbol !== currentSymbol) {
      setCurrentSymbol(symbol);
      dataInitializedRef.current = false;
    }
    if (interval !== currentInterval) {
      setCurrentInterval(interval);
      dataInitializedRef.current = false;
    }
    if (chartType !== currentChartType) {
      setCurrentChartType(chartType);
    }
  }, [symbol, interval, chartType]);

  const handleAddIndicator = (indicator: IndicatorConfig) => {
    logChart('Add Indicator', { indicator });
    setActiveIndicators((prev) => [...prev, indicator]);
  };

  const handleRemoveIndicator = (id: string) => {
    logChart('Remove Indicator', { id });
    setActiveIndicators((prev) => prev.filter((ind) => ind.id !== id));
  };

  const handleUpdateIndicator = (id: string, updates: Partial<IndicatorConfig>) => {
    logChart('Update Indicator', { id, updates });
    setActiveIndicators((prev) =>
      prev.map((ind) => (ind.id === id ? { ...ind, ...updates } : ind))
    );
  };

  const handleToolSelect = (tool: string) => {
    logChart('Tool Selected', { tool });
  };

  return (
    <ErrorBoundary>
      <div className="flex h-full relative">
        {/* Drawing Toolbar as a fixed sidebar */}
        {showDrawingTools && (
          <DrawingToolbar onToolSelect={handleToolSelect} />
        )}

        {/* Main chart area grows */}
        <div className="flex-1 flex flex-col">
          {/* Overlays */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <div className="p-4 bg-[#2A2E39] rounded-md">
                <span className="text-white">Loading data...</span>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <div className="p-4 bg-[#2A2E39] rounded-md max-w-md">
                <span className="text-red-400">Error: {error}</span>
              </div>
            </div>
          )}

          {/* Chart Toolbar (no SymbolSelector here, only timeframe + indicators) */}
          <ChartToolbar
            onTimeframeChange={(tf) => setCurrentInterval(tf)}
            onAddIndicator={handleAddIndicator}
            onRemove={handleRemoveIndicator}
            onUpdate={handleUpdateIndicator}
            initialTimeframe={currentInterval}
          />

          {/* Chart area */}
          <div className="flex-1 relative">
            {warning && (
              <div className="absolute top-2 right-2 p-2 bg-yellow-900 bg-opacity-80 rounded-md z-10">
                <span className="text-yellow-300 text-sm">{warning}</span>
              </div>
            )}

            {isConnected && !usingFallback && (
              <div className="absolute top-2 left-2 p-1 bg-green-900 bg-opacity-80 rounded-md z-10">
                <span className="text-green-400 text-xs">LIVE</span>
              </div>
            )}
            
            {usingFallback && (
              <div className="absolute top-2 left-2 p-1 bg-yellow-700 bg-opacity-80 rounded-md z-10">
                <span className="text-yellow-300 text-xs">SIMULATED</span>
              </div>
            )}

            <Chart
              data={chartData}
              chartType={currentChartType}
              indicators={activeIndicators}
            />
          </div>

          {/* Active Indicators Panel */}
          <ActiveIndicators
            indicators={activeIndicators}
            onRemove={handleRemoveIndicator}
            onUpdate={handleUpdateIndicator}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default ChartContainer;
