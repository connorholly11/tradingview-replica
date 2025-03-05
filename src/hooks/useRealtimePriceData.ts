'use client';

import { useState, useEffect, useRef } from 'react';
// import polygonWebSocketService from '@/lib/websocketService';
import coinbaseWebSocketService from '@/lib/coinbaseWebSocketService';
import { ChartData } from '@/lib/apiService';
import { UTCTimestamp } from 'lightweight-charts';

const logHook = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[useRealtimePriceData ${timestamp}]`, action, details || '');
};

interface UseRealtimePriceDataOptions {
  initialData?: ChartData[];
  onUpdate?: (data: ChartData[]) => void;
  // Only allow Coinbase as the data source
  dataSource?: 'coinbase';
}

export function useRealtimePriceData(
  symbol: string,
  options: UseRealtimePriceDataOptions = {}
) {
  const {
    initialData = [],
    onUpdate,
    dataSource = 'coinbase' // Set coinbase as the default data source
  } = options;
  const [data, setData] = useState<ChartData[]>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionFailures, setConnectionFailures] = useState(0);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const isMountedRef = useRef(true);

  // Create a fallback timer for simulation if WebSocket keeps failing
  useEffect(() => {
    if (error && connectionFailures > 2 && !useFallbackData) {
      logHook('WebSocket failures detected, switching to fallback simulation mode', { 
        symbol, 
        error, 
        failureCount: connectionFailures,
        dataSource
      });
      setUseFallbackData(true);
    }
  }, [error, connectionFailures, useFallbackData, symbol, dataSource]);

  // Simulate data updates if using fallback mode
  useEffect(() => {
    if (!useFallbackData) return;
    
    const lastData = data.length > 0 ? data[data.length - 1] : null;
    if (!lastData) return;
    
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      
      // Create a simulated price update
      const changePercent = (Math.random() * 0.4) - 0.2; // -0.2% to +0.2%
      const priceChange = lastData.close * (changePercent / 100);
      const newPrice = lastData.close + priceChange;
      
      const newDataPoint: ChartData = {
        time: (Math.floor(Date.now() / 1000)) as UTCTimestamp,
        open: lastData.close,
        high: Math.max(lastData.close, newPrice),
        low: Math.min(lastData.close, newPrice),
        close: newPrice,
        volume: Math.floor(Math.random() * 1000) + 100
      };
      
      setData(prev => {
        const updated = [...prev, newDataPoint];
        if (onUpdate) {
          onUpdate(updated);
        }
        return updated;
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [useFallbackData, data, onUpdate]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    logHook('Initializing WebSocket connection', { 
      symbol, 
      dataSource, 
      browserInfo: typeof window !== 'undefined' ? {
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        vendor: window.navigator.vendor
      } : 'SSR'
    });

    try {
      /* // Commenting out Polygon code
      if (dataSource === 'polygon') {
        polygonWebSocketService.init();
        polygonWebSocketService.onConnect = () => {
          if (!isMountedRef.current) return;
          logHook('Polygon WebSocket Connected', { symbol });
          setIsConnected(true);
          setConnectionFailures(0);
          polygonWebSocketService.connectToSymbol(symbol);
        };
        polygonWebSocketService.onDisconnect = () => {
          if (!isMountedRef.current) return;
          logHook('Polygon WebSocket Disconnected', { symbol });
          setIsConnected(false);
        };
        polygonWebSocketService.onError = (err) => {
          if (!isMountedRef.current) return;
          const msg = err instanceof Error ? err.message : 'Unknown error';
          logHook('Polygon WS Error', { msg });
          setError(msg);
          setConnectionFailures(prev => prev + 1);
        };
        polygonWebSocketService.onMessage = (update) => {
          if (!isMountedRef.current || !update) return;
          try {
            // Convert to ChartData
            const newDataPoint: ChartData = {
              time: (update.t / 1000) as UTCTimestamp,
              open: update.o,
              high: update.h,
              low: update.l,
              close: update.c,
              volume: update.v
            };
            setData(prev => {
              if (prev.length === 0) return [newDataPoint];
              const last = prev[prev.length - 1];
              if (Math.floor(last.time as number) === Math.floor(newDataPoint.time as number)) {
                // update last candle
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...last,
                  high: Math.max(last.high, newDataPoint.high),
                  low: Math.min(last.low, newDataPoint.low),
                  close: newDataPoint.close,
                  volume: (last.volume || 0) + (newDataPoint.volume || 0)
                };
                if (onUpdate) {
                  onUpdate(updated);
                }
                return updated;
              } else {
                const updated = [...prev, newDataPoint];
                if (onUpdate) {
                  onUpdate(updated);
                }
                return updated;
              }
            });
          } catch (e) {
            console.error('Error processing polygon message', e);
          }
        };
        // Actually connect
        polygonWebSocketService.connectToSymbol(symbol);

      } else */ 
      if (dataSource === 'coinbase') {
        coinbaseWebSocketService.init();
        coinbaseWebSocketService.onConnect = () => {
          if (!isMountedRef.current) return;
          logHook('Coinbase WS Connected', {});
          setIsConnected(true);
          setConnectionFailures(0); // Reset failure counter on successful connection
        };
        coinbaseWebSocketService.onDisconnect = () => {
          if (!isMountedRef.current) return;
          logHook('Coinbase WS Disconnected', {});
          setIsConnected(false);
        };
        coinbaseWebSocketService.onError = (err) => {
          if (!isMountedRef.current) return;
          const msg = err instanceof Error ? err.message : 'Unknown error';
          logHook('Coinbase WS Error', { msg });
          setError(msg);
          setConnectionFailures(prev => prev + 1);
        };
        coinbaseWebSocketService.onMessage = (tickerData) => {
          if (!isMountedRef.current) return;
          // We'll interpret the coinbase ticker data
          const newDataPoint: ChartData = {
            time: Math.floor(tickerData.t / 1000) as UTCTimestamp,
            open: tickerData.price,
            high: tickerData.price,
            low: tickerData.price,
            close: tickerData.price,
            volume: 0
          };
          setData(prev => {
            if (prev.length === 0) return [newDataPoint];
            const last = prev[prev.length - 1];
            if (Math.floor(last.time as number) === Math.floor(newDataPoint.time as number)) {
              // update last candle
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                high: Math.max(last.high, newDataPoint.high),
                low: Math.min(last.low, newDataPoint.low),
                close: newDataPoint.close
              };
              if (onUpdate) {
                onUpdate(updated);
              }
              return updated;
            } else {
              const updated = [...prev, newDataPoint];
              if (onUpdate) {
                onUpdate(updated);
              }
              return updated;
            }
          });
        };
        coinbaseWebSocketService.connectForBTC();
      }
    } catch (initError) {
      console.error('Error initializing real-time service:', initError);
      setError('Failed to initialize real-time data');
      setConnectionFailures(prev => prev + 1);
    }

    return () => {
      logHook('Cleaning up', { symbol, dataSource });
      /* // Comment out Polygon cleanup
      if (dataSource === 'polygon') {
        polygonWebSocketService.disconnect();
      } else {
        coinbaseWebSocketService.disconnect();
      } */
      
      // Only cleanup Coinbase
      coinbaseWebSocketService.disconnect();
    };
  }, [symbol, dataSource, onUpdate]);

  return {
    data,
    isConnected,
    error,
    usingFallback: useFallbackData
  };
}
