'use client';

import { useEffect, useRef } from 'react';
import { 
  createChart, 
  ColorType, 
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineData,
  Time
} from 'lightweight-charts';
import { ChartData } from '@/lib/apiService';
import { createIndicatorData } from '@/lib/indicatorsService';

interface IndicatorConfig {
  id: string;
  type: string;
  name: string;
  color: string;
  visible: boolean;
  settings: Record<string, number>;
}

interface ChartProps {
  data: ChartData[];
  indicators?: IndicatorConfig[];
  chartType?: 'candle' | 'bar' | 'line';
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
  width?: number;
  height?: number;
}

/**
 * Logger function for chart rendering and updates
 * @param action The action being performed
 * @param details Details about the action
 */
const logChartRenderer = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[ChartRenderer ${timestamp}]`, action, details || '');
};

export const Chart = ({
  data,
  indicators = [],
  chartType = 'candle',
  colors = {
    backgroundColor: '#131722',
    lineColor: '#2962FF',
    textColor: '#D9D9D9',
    areaTopColor: 'rgba(41, 98, 255, 0.3)',
    areaBottomColor: 'rgba(41, 98, 255, 0.05)',
  },
  width,
  height,
}: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Bar"> | null>(null);
  const indicatorSeriesRefs = useRef<Record<string, ISeriesApi<"Line">>>({});
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;
    
    logChartRenderer('Creating chart', { chartType, colors });

    const chart = createChart(container, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: colors.backgroundColor || '#131722',
        },
        textColor: colors.textColor || '#D9D9D9',
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
      },
      width: width || container.clientWidth,
      height: height || container.clientHeight,
      grid: {
        vertLines: {
          color: 'rgba(42, 46, 57, 0.3)',
          style: 1, // Solid line
        },
        horzLines: {
          color: 'rgba(42, 46, 57, 0.3)',
          style: 1, // Solid line
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(42, 46, 57, 0.8)',
        borderVisible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(42, 46, 57, 0.8)',
        borderVisible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
        entireTextOnly: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(224, 227, 235, 0.5)',
          width: 1,
          style: 1, // Solid line
          labelBackgroundColor: '#131722',
          labelVisible: true,
        },
        horzLine: {
          color: 'rgba(224, 227, 235, 0.5)',
          width: 1,
          style: 1, // Solid line
          labelBackgroundColor: '#131722',
          labelVisible: true,
        },
      },
      localization: {
        priceFormatter: (price: number) => {
          // Format price with thousand separators
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price);
        },
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        },
      },
      handleScroll: {
        vertTouchDrag: true,
        horzTouchDrag: true,
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      watermark: {
        visible: true,
        color: 'rgba(255, 255, 255, 0.05)',
        text: '',
        fontSize: 96,
        fontStyle: 'bold',
        horzAlign: 'center',
        vertAlign: 'center',
      },
    });

    // Store the chart reference
    chartRef.current = chart;

    // Create appropriate series based on chart type
    let mainSeries;
    
    if (chartType === 'candle') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', // Green for up candles
        downColor: '#ef5350', // Red for down candles
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
    } else if (chartType === 'bar') {
      mainSeries = chart.addBarSeries({
        upColor: '#26a69a', // Green for up bars
        downColor: '#ef5350', // Red for down bars
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
    } else {
      mainSeries = chart.addLineSeries({
        color: colors.lineColor || '#2962FF',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        lineType: 0, // Solid line
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
    }

    // Store the series reference
    mainSeriesRef.current = mainSeries;

    // Set the data
    mainSeries.setData(data);

    // Create indicator series if present
    indicators.forEach(indicator => {
      if (!indicator.visible) return;
      
      const indicatorData = createIndicatorData(indicator.type, data, indicator.settings);
      
      if (indicatorData) {
        const lineSeries = chart.addLineSeries({
          color: indicator.color,
          lineWidth: 1,
          crosshairMarkerVisible: true,
          lastValueVisible: true,
          priceScaleId: 'right', // Use the same price scale as main series
          title: indicator.name,
        });
        
        // Convert time number to Time type expected by lightweight-charts
        const formattedData: LineData[] = indicatorData.map(item => ({
          time: item.time as Time,
          value: item.value
        }));
        
        lineSeries.setData(formattedData);
        indicatorSeriesRefs.current[indicator.id] = lineSeries;
      }
    });

    // Fit content to view all data
    chart.timeScale().fitContent();
    
    // Apply dark theme styling for price scale and time scale
    chart.applyOptions({
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: colors.backgroundColor || '#131722'
        },
        textColor: colors.textColor || '#D9D9D9',
      },
    });

    // Create a resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
      chart.timeScale().fitContent();
    });
    
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    // Cleanup function
    return () => {
      logChartRenderer('Cleaning up chart');
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      
      mainSeriesRef.current = null;
      indicatorSeriesRefs.current = {};
    };
  }, [chartType, colors, height, width, data, indicators]);

  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
};

export default Chart; 