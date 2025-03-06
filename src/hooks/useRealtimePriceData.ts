// src/hooks/useRealtimePriceData.ts

'use client';

import { useState, useEffect, useRef } from 'react';
import coinbaseWebSocketService from '@/lib/coinbaseWebSocketService';
import { ChartData } from '@/lib/apiService';
import { UTCTimestamp } from 'lightweight-charts';

const logHook = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[useRealtimePriceData ${timestamp}]`, action, details || {});
};

interface UseRealtimePriceDataOptions {
  initialData?: ChartData[];
  onUpdate?: (data: ChartData[]) => void;
  dataSource?: 'coinbase'; // only coinbase supported now
}

/**
 * Hook: useRealtimePriceData
 * Connects to coinbaseWebSocketService for live price updates.
 */
export function useRealtimePriceData(
  symbol: string,
  options: UseRealtimePriceDataOptions = {}
) {
  const {
    initialData = [],
    onUpdate,
    dataSource = 'coinbase',
  } = options;

  const [data, setData] = useState<ChartData[]>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionFailures, setConnectionFailures] = useState(0);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // If repeated connection errors, fallback to simulation
  useEffect(() => {
    if (error && connectionFailures > 2 && !useFallbackData) {
      logHook('Switching to fallback simulation mode', {
        symbol,
        error,
        failureCount: connectionFailures,
        dataSource,
      });
      setUseFallbackData(true);
    }
  }, [error, connectionFailures, useFallbackData, symbol, dataSource]);

  // Simulate data if fallback is enabled
  useEffect(() => {
    if (!useFallbackData) return;
    if (data.length === 0) return;

    const lastData = data[data.length - 1];
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      const changePercent = (Math.random() * 0.4) - 0.2; // -0.2%..+0.2%
      const priceChange = lastData.close * (changePercent / 100);
      const newPrice = lastData.close + priceChange;

      const newDataPoint: ChartData = {
        time: Math.floor(Date.now() / 1000) as UTCTimestamp,
        open: lastData.close,
        high: Math.max(lastData.close, newPrice),
        low: Math.min(lastData.close, newPrice),
        close: newPrice,
        volume: Math.floor(Math.random() * 1000) + 100,
      };

      setData((prev) => {
        const updated = [...prev, newDataPoint];
        onUpdate?.(updated);
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [useFallbackData, data, onUpdate]);

  // Connect to coinbase if not fallback
  useEffect(() => {
    if (dataSource !== 'coinbase') {
      return;
    }

    // Attempt connection
    logHook('Initializing Coinbase WS connection', { symbol });

    try {
      coinbaseWebSocketService.init();

      coinbaseWebSocketService.onConnect = () => {
        if (!isMountedRef.current) return;
        logHook('Coinbase WS Connected', {});
        setIsConnected(true);
        setConnectionFailures(0);
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
        setConnectionFailures((prev) => prev + 1);
      };

      coinbaseWebSocketService.onMessage = (tickerData) => {
        if (!isMountedRef.current) return;
        // Convert single price update into ChartData candle
        const newDataPoint: ChartData = {
          time: Math.floor(tickerData.t / 1000) as UTCTimestamp,
          open: tickerData.price,
          high: tickerData.price,
          low: tickerData.price,
          close: tickerData.price,
        };

        setData((prev) => {
          if (prev.length === 0) {
            const updated = [newDataPoint];
            onUpdate?.(updated);
            return updated;
          }

          const last = prev[prev.length - 1];
          if (Math.floor(last.time as number) === Math.floor(newDataPoint.time as number)) {
            // same candle timestamp, update existing
            const merged = {
              ...last,
              high: Math.max(last.high, newDataPoint.high),
              low: Math.min(last.low, newDataPoint.low),
              close: newDataPoint.close,
            };
            const updated = [...prev.slice(0, -1), merged];
            onUpdate?.(updated);
            return updated;
          } else {
            const updated = [...prev, newDataPoint];
            onUpdate?.(updated);
            return updated;
          }
        });
      };

      // Start the subscription
      coinbaseWebSocketService.connectToSymbol(symbol);
    } catch (initError) {
      console.error('Error initializing real-time service:', initError);
      setError('Failed to initialize real-time data');
      setConnectionFailures((prev) => prev + 1);
    }

    return () => {
      logHook('Cleaning up Coinbase WS connection', { symbol });
      coinbaseWebSocketService.disconnect();
    };
  }, [symbol, dataSource, onUpdate]);

  return {
    data,
    isConnected,
    error,
    usingFallback: useFallbackData,
  };
}
