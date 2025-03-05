'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import Chart from './Chart';
import ChartToolbar from './ChartToolbar';
import ActiveIndicators from './ActiveIndicators';
import DrawingToolbar from './DrawingToolbar';
import { 
  fetchPolygonAggregates, 
  mapTimeframeToPolygonParams, 
  getTimeframeDateRange,
  ChartData
} from '@/lib/apiService';
import { UTCTimestamp } from 'lightweight-charts';
import polygonWebSocketService from '@/lib/websocketService';

/**
 * Logger function for chart interactions
 * @param action The action being performed
 * @param details Details about the action
 */
const logChart = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[Chart ${timestamp}]`, action, details || '');
};

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
}

const ChartContainerComponent = forwardRef<
  { toggleDrawingTools: () => void },
  ChartContainerProps
>(({ symbol = 'AAPL', interval = '1D', chartType = 'candle' }, ref) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [currentChartType, setCurrentChartType] = useState(chartType);
  const [activeIndicators, setActiveIndicators] = useState<IndicatorConfig[]>([]);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [isLiveData, setIsLiveData] = useState(false);
  const wsConnectedRef = useRef(false);
  
  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    toggleDrawingTools: () => {
      logChart('Toggle Drawing Tools', { showDrawingTools: !showDrawingTools });
      setShowDrawingTools(!showDrawingTools);
    }
  }));

  // Function to handle real-time data updates
  const handleRealtimeUpdate = (update: {
    t: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
  }) => {
    if (!update || !chartData.length) return;
    
    // Create a new data point from the WebSocket update
    const newDataPoint: ChartData = {
      time: (update.t / 1000) as UTCTimestamp,
      open: update.o,
      high: update.h,
      low: update.l,
      close: update.c,
      volume: update.v
    };
    
    // Log the received update
    logChart('Received real-time update', {
      symbol: currentSymbol,
      time: new Date(update.t).toISOString(),
      price: update.c
    });
    
    // Check if we should update the last candle or add a new one
    const lastCandle = chartData[chartData.length - 1];
    const lastCandleTime = lastCandle.time;
    
    // For 1-minute candles, check if the update belongs to the current candle
    // This logic would need to be adjusted based on the timeframe
    if (currentInterval === '1m' && Math.floor(lastCandleTime / 60) === Math.floor(newDataPoint.time / 60)) {
      // Update the existing candle
      const updatedCandle = {
        ...lastCandle,
        high: Math.max(lastCandle.high, newDataPoint.high),
        low: Math.min(lastCandle.low, newDataPoint.low),
        close: newDataPoint.close,
        volume: (lastCandle.volume || 0) + (newDataPoint.volume || 0)
      };
      
      logChart('Updating existing candle', {
        symbol: currentSymbol,
        timeframe: currentInterval,
        candle: updatedCandle
      });
      
      // Replace the last candle with the updated one
      setChartData(prevData => [
        ...prevData.slice(0, -1),
        updatedCandle
      ]);
    } else {
      // Add a new candle
      logChart('Adding new candle', {
        symbol: currentSymbol,
        timeframe: currentInterval,
        candle: newDataPoint
      });
      
      setChartData(prevData => [...prevData, newDataPoint]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      logChart('Fetching data', { symbol: currentSymbol, interval: currentInterval });
      setIsLoading(true);
      setError(null);
      setWarning(null);
      
      try {
        // Map the interval to polygon API parameters
        const { multiplier, timespan } = mapTimeframeToPolygonParams(currentInterval);
        
        // Get appropriate date range based on timeframe
        const { from, to } = getTimeframeDateRange(currentInterval);
        
        logChart('API Request', { 
          symbol: currentSymbol, 
          multiplier, 
          timespan, 
          from, 
          to 
        });
        
        // Fetch data from Polygon API
        const { data, error, warning } = await fetchPolygonAggregates(
          currentSymbol,
          multiplier,
          timespan,
          from,
          to
        );
        
        if (error) {
          logChart('API Error', { symbol: currentSymbol, error });
          setError(error);
          setChartData([]);
          setIsLoading(false);
          return;
        }
        
        if (warning) {
          logChart('API Warning', { symbol: currentSymbol, warning });
          setWarning(warning);
        }
        
        if (data.length === 0) {
          const noDataError = `No data available for ${currentSymbol} in the selected time range.`;
          logChart('No Data', { symbol: currentSymbol, interval: currentInterval });
          setError(noDataError);
          setChartData([]);
          setIsLoading(false);
          return;
        }
        
        logChart('Data Received', { 
          symbol: currentSymbol, 
          interval: currentInterval,
          count: data.length,
          firstCandle: data[0],
          lastCandle: data[data.length - 1]
        });
        
        setChartData(data);
        
        // Connect to WebSocket for real-time updates if using minute timeframes
        if (['1m', '5m', '15m', '30m'].includes(currentInterval)) {
          // Only connect to WebSocket for minute-based timeframes
          logChart('Connecting to WebSocket', { symbol: currentSymbol, interval: currentInterval });
          connectToWebSocket();
          setIsLiveData(true);
        } else {
          // Disconnect WebSocket for other timeframes
          logChart('Disconnecting WebSocket - not a real-time timeframe', { interval: currentInterval });
          disconnectWebSocket();
          setIsLiveData(false);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        logChart('Fetch Error', { symbol: currentSymbol, error: String(err) });
        setError('Failed to load chart data. Please try again later.');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      disconnectWebSocket();
    };
  }, [currentSymbol, currentInterval]);

  useEffect(() => {
    logChart('Updating chart type', { from: currentChartType, to: chartType });
    setCurrentChartType(chartType);
  }, [chartType]);

  // Function to connect to WebSocket
  const connectToWebSocket = () => {
    if (wsConnectedRef.current) {
      logChart('WebSocket already connected, reconnecting', { symbol: currentSymbol });
      disconnectWebSocket();
    }
    
    // Initialize WebSocket connection
    polygonWebSocketService.init();
    
    // Set up event handlers
    polygonWebSocketService.onMessage = handleRealtimeUpdate;
    polygonWebSocketService.onError = (error: Error | Event) => {
      console.error('WebSocket error:', error);
      logChart('WebSocket Error', { symbol: currentSymbol, error: String(error) });
      setWarning('Live data connection error. Falling back to historical data only.');
      setIsLiveData(false);
    };
    
    polygonWebSocketService.onConnect = () => {
      logChart('WebSocket Connected', { symbol: currentSymbol });
    };
    
    polygonWebSocketService.onDisconnect = () => {
      logChart('WebSocket Disconnected', { symbol: currentSymbol });
      setIsLiveData(false);
    };
    
    // Connect to the current symbol
    polygonWebSocketService.connectToSymbol(currentSymbol);
    wsConnectedRef.current = true;
  };

  // Function to disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsConnectedRef.current) {
      logChart('Disconnecting WebSocket', { symbol: currentSymbol });
      polygonWebSocketService.disconnect();
      wsConnectedRef.current = false;
    }
  };

  const handleSymbolChange = (newSymbol: string) => {
    // Disconnect current WebSocket before changing symbol
    logChart('Symbol Change', { from: currentSymbol, to: newSymbol });
    disconnectWebSocket();
    setCurrentSymbol(newSymbol);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    // Disconnect current WebSocket before changing timeframe
    logChart('Timeframe Change', { from: currentInterval, to: newTimeframe });
    disconnectWebSocket();
    setCurrentInterval(newTimeframe);
  };

  const handleAddIndicator = (indicator: IndicatorConfig) => {
    logChart('Add Indicator', { type: indicator.type, id: indicator.id, settings: indicator.settings });
    setActiveIndicators([...activeIndicators, indicator]);
  };

  const handleRemoveIndicator = (id: string) => {
    logChart('Remove Indicator', { id });
    setActiveIndicators(activeIndicators.filter(indicator => indicator.id !== id));
  };

  const handleUpdateIndicator = (id: string, updates: Partial<IndicatorConfig>) => {
    logChart('Update Indicator', { id, updates });
    setActiveIndicators(
      activeIndicators.map(indicator => 
        indicator.id === id ? { ...indicator, ...updates } : indicator
      )
    );
  };

  const handleToolSelect = (tool: string) => {
    logChart('Tool Selected', { tool });
    console.log('Selected tool:', tool);
    // In a real app, we would apply the selected drawing tool
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ChartToolbar 
        onSymbolChange={handleSymbolChange}
        onTimeframeChange={handleTimeframeChange}
        onAddIndicator={handleAddIndicator}
        onRemoveIndicator={handleRemoveIndicator}
        onUpdateIndicator={handleUpdateIndicator}
        initialSymbol={currentSymbol}
        initialTimeframe={currentInterval}
      />
      
      <div className="flex-1 relative flex">
        {/* Drawing Tools Sidebar */}
        {showDrawingTools && (
          <div className="w-12">
            <DrawingToolbar onToolSelect={handleToolSelect} />
          </div>
        )}
        
        {/* Main Chart Area */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">Loading chart data for {currentSymbol}...</p>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-red-400">{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => {
                  logChart('Retry Data Load', { symbol: currentSymbol });
                  setIsLoading(true);
                  setError(null);
                  // Trigger a refetch by setting the symbol to itself
                  setCurrentSymbol(currentSymbol);
                }}
              >
                Retry
              </button>
            </div>
          ) : chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">No data available for {currentSymbol}</p>
            </div>
          ) : (
            <div className="w-full h-full relative">
              {warning && (
                <div className="absolute top-2 left-0 right-0 mx-auto w-max z-10 bg-amber-600 text-white px-4 py-2 rounded-md text-sm shadow-lg">
                  <span className="mr-2">⚠️</span>
                  {warning}
                  <button 
                    className="ml-2 text-white font-bold"
                    onClick={() => {
                      logChart('Dismiss Warning', { warning });
                      setWarning(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {isLiveData && (
                <div className="absolute top-2 left-2 z-10 bg-green-600 text-white px-2 py-1 rounded-md text-xs shadow-lg flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></span>
                  LIVE
                </div>
              )}
              
              <Chart 
                data={chartData} 
                indicators={activeIndicators}
                chartType={currentChartType}
                colors={{
                  backgroundColor: '#131722',
                  lineColor: '#2962FF',
                  textColor: '#D9D9D9',
                  areaTopColor: 'rgba(41, 98, 255, 0.3)',
                  areaBottomColor: 'rgba(41, 98, 255, 0.05)',
                }}
              />
              
              {activeIndicators.length > 0 && (
                <div className="absolute top-2 right-2">
                  <ActiveIndicators 
                    indicators={activeIndicators}
                    onRemoveIndicator={handleRemoveIndicator}
                    onUpdateIndicator={handleUpdateIndicator}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Set display name
ChartContainerComponent.displayName = 'ChartContainer';

export const ChartContainer = ChartContainerComponent;
export default ChartContainer; 