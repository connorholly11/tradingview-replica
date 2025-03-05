'use client';

import { useState, useEffect, useRef } from 'react';
import polygonWebSocketService from '@/lib/websocketService';
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
  dataSource?: 'polygon' | 'coinbase';
}

export function useRealtimePriceData(
  symbol: string,
  options: UseRealtimePriceDataOptions = {}
) {
  const {
    initialData = [],
    onUpdate,
    dataSource = 'polygon'
  } = options;
  const [data, setData] = useState<ChartData[]>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    logHook('Initializing', { symbol, dataSource });

    try {
      if (dataSource === 'polygon') {
        polygonWebSocketService.init();
        polygonWebSocketService.onConnect = () => {
          if (!isMountedRef.current) return;
          logHook('Polygon WebSocket Connected', { symbol });
          setIsConnected(true);
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

      } else if (dataSource === 'coinbase') {
        coinbaseWebSocketService.init();
        coinbaseWebSocketService.onConnect = () => {
          if (!isMountedRef.current) return;
          logHook('Coinbase WS Connected', {});
          setIsConnected(true);
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
    }

    return () => {
      logHook('Cleaning up', { symbol, dataSource });
      if (dataSource === 'polygon') {
        polygonWebSocketService.disconnect();
      } else {
        coinbaseWebSocketService.disconnect();
      }
    };
  }, [symbol, dataSource, onUpdate]);

  return {
    data,
    isConnected,
    error
  };
}
