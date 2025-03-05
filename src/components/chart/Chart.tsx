'use client';

import { useEffect, useRef } from 'react';
import { 
  createChart, 
  ColorType, 
  Time,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  BarData,
  UTCTimestamp
} from 'lightweight-charts';
import { ChartData } from '@/lib/apiService';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateStochasticRSI,
  createIndicatorData 
} from '@/lib/indicatorsService';

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
      },
      width: width || container.clientWidth,
      height: height || container.clientHeight,
      grid: {
        vertLines: {
          color: 'rgba(42, 46, 57, 0.6)',
          style: 1, // Solid line
        },
        horzLines: {
          color: 'rgba(42, 46, 57, 0.6)',
          style: 1, // Solid line
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2A2E39',
        borderVisible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
      },
      rightPriceScale: {
        borderColor: '#2A2E39',
        borderVisible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(224, 227, 235, 0.1)',
          style: 0, // Solid line
          width: 1,
          labelBackgroundColor: '#131722',
        },
        horzLine: {
          color: 'rgba(224, 227, 235, 0.1)',
          style: 0, // Solid line
          width: 1,
          labelBackgroundColor: '#131722',
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
      },
    });

    const handleResize = () => {
      chart.applyOptions({ 
        width: container.clientWidth, 
        height: container.clientHeight 
      });
    };

    // Add series based on chart type
    let mainSeries;
    
    switch (chartType) {
      case 'bar':
        mainSeries = chart.addBarSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          thinBars: false,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#2962FF',
          priceLineStyle: 2, // Dashed
          lastValueVisible: true,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        break;
        
      case 'line':
        mainSeries = chart.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          lineType: 0, // Solid line
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#2962FF',
          priceLineStyle: 2, // Dashed
          lastValueVisible: true,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        
        // For line chart, we only need the close price
        const lineData = data.map(item => ({
          time: item.time,
          value: item.close
        }));
        
        mainSeries.setData(lineData);
        break;
        
      case 'candle':
      default:
        mainSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#2962FF',
          priceLineStyle: 2, // Dashed
          lastValueVisible: true,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        
        mainSeries.setData(data);
        break;
    }
    
    // Set data for bar chart (candle data is set in the default case)
    if (chartType === 'bar') {
      mainSeries.setData(data);
    }

    // Create price lines for key levels if needed
    if (data.length > 0) {
      // Last price line
      const lastValue = data[data.length - 1].close;
      mainSeries.createPriceLine({
        price: lastValue,
        color: '#2962FF',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Current',
      });
    }

    // Optional volume series if volume data is available
    if (data[0]?.volume !== undefined) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      
      // Configure scale margins separately
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      
      // Volume data with color based on price movement
      const volumeData = data.map((item, index) => {
        const isUp = index > 0 ? item.close > data[index - 1].close : item.close > item.open;
        return {
          time: item.time as Time,
          value: item.volume || 0,
          color: isUp ? 'rgba(38, 166, 154, 0.6)' : 'rgba(239, 83, 80, 0.6)', // Semi-transparent
        };
      });
      
      volumeSeries.setData(volumeData);
    }

    // Add indicators if any are provided
    if (indicators && indicators.length > 0) {
      indicators.forEach((indicator) => {
        if (!indicator.visible) return;

        switch (indicator.type) {
          case 'sma': {
            const period = indicator.settings.period || 20;
            const smaData = calculateSMA(data, period);
            const formattedData = createIndicatorData(data, smaData).map(item => ({
              time: item.time as Time,
              value: item.value
            }));
            
            const lineSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: `SMA (${period})`,
            });
            
            lineSeries.setData(formattedData);
            break;
          }
          case 'ema': {
            const period = indicator.settings.period || 20;
            const emaData = calculateEMA(data, period);
            const formattedData = createIndicatorData(data, emaData).map(item => ({
              time: item.time as Time,
              value: item.value
            }));
            
            const lineSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: `EMA (${period})`,
            });
            
            lineSeries.setData(formattedData);
            break;
          }
          case 'rsi': {
            const period = indicator.settings.period || 14;
            const rsiData = calculateRSI(data, period);
            const formattedData = createIndicatorData(data, rsiData).map(item => ({
              time: item.time as Time,
              value: item.value
            }));
            
            // Create a separate pane for RSI
            const rsiSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: `RSI (${period})`,
              priceScaleId: 'rsi',
              priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
              },
            });
            
            // Set price range for RSI (0-100)
            rsiSeries.priceScale().applyOptions({
              autoScale: false,
              scaleMargins: {
                top: 0.1,
                bottom: 0.1,
              },
            });
            
            // Add level lines for overbought/oversold conditions
            const overbought = indicator.settings.overbought || 70;
            const oversold = indicator.settings.oversold || 30;
            
            rsiSeries.createPriceLine({
              price: overbought,
              color: 'red',
              lineWidth: 1,
              lineStyle: 2, // Dashed
              axisLabelVisible: true,
              title: 'Overbought',
            });
            
            rsiSeries.createPriceLine({
              price: oversold,
              color: 'green',
              lineWidth: 1,
              lineStyle: 2, // Dashed
              axisLabelVisible: true,
              title: 'Oversold',
            });

            rsiSeries.setData(formattedData);
            break;
          }
          case 'macd': {
            const fastPeriod = indicator.settings.fastPeriod || 12;
            const slowPeriod = indicator.settings.slowPeriod || 26;
            const signalPeriod = indicator.settings.signalPeriod || 9;
            
            const macdResult = calculateMACD(data, fastPeriod, slowPeriod, signalPeriod);
            
            // Create a separate pane for MACD
            const macdSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: 1,
              title: `MACD (${fastPeriod},${slowPeriod},${signalPeriod})`,
              priceScaleId: 'macd',
            });
            
            // Add the signal line
            const signalSeries = chart.addLineSeries({
              color: '#FF5252',
              lineWidth: 1,
              title: 'Signal',
              priceScaleId: 'macd',
            });
            
            // Add the histogram
            const histogramSeries = chart.addHistogramSeries({
              color: '#26a69a',
              priceScaleId: 'macd',
              priceFormat: {
                type: 'price',
                precision: 2,
              },
            });
            
            // Format and set data
            if (Array.isArray(macdResult) && macdResult.length > 0) {
              const macdLength = macdResult.length;
              const dataOffset = data.length - macdLength;
              
              const macdLineData = macdResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.MACD
              }));
              
              const signalLineData = macdResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.signal
              }));
              
              const histogramData = macdResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.histogram,
                color: item.histogram >= 0 ? '#26a69a' : '#ef5350',
              }));
              
              macdSeries.setData(macdLineData);
              signalSeries.setData(signalLineData);
              histogramSeries.setData(histogramData);
              
              // Set the same price scale for both indicators
              macdSeries.priceScale().applyOptions({
                scaleMargins: {
                  top: 0.3,
                  bottom: 0.3,
                },
                autoScale: true,
              });
            }
            
            break;
          }
          case 'bollingerBands': {
            const period = indicator.settings.period || 20;
            const stdDev = indicator.settings.stdDev || 2;
            
            const bbResult = calculateBollingerBands(data, period, stdDev);
            
            if (Array.isArray(bbResult) && bbResult.length > 0) {
              const bbLength = bbResult.length;
              const dataOffset = data.length - bbLength;
              
              // Middle band (SMA)
              const middleBandSeries = chart.addLineSeries({
                color: indicator.color,
                lineWidth: 1,
                title: `BB Middle (${period})`,
              });
              
              // Upper band
              const upperBandSeries = chart.addLineSeries({
                color: indicator.color,
                lineWidth: 1,
                title: `BB Upper (${period}, ${stdDev})`,
                lineStyle: 2, // Dashed
              });
              
              // Lower band
              const lowerBandSeries = chart.addLineSeries({
                color: indicator.color,
                lineWidth: 1,
                title: `BB Lower (${period}, ${stdDev})`,
                lineStyle: 2, // Dashed
              });
              
              // Format data
              const middleBandData = bbResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.middle
              }));
              
              const upperBandData = bbResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.upper
              }));
              
              const lowerBandData = bbResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.lower
              }));
              
              // Set data
              middleBandSeries.setData(middleBandData);
              upperBandSeries.setData(upperBandData);
              lowerBandSeries.setData(lowerBandData);
            }
            
            break;
          }
          case 'stochasticRSI': {
            const rsiPeriod = indicator.settings.rsiPeriod || 14;
            const stochasticPeriod = indicator.settings.stochasticPeriod || 14;
            const kPeriod = indicator.settings.kPeriod || 3;
            const dPeriod = indicator.settings.dPeriod || 3;
            
            const stochRSIResult = calculateStochasticRSI(
              data, 
              rsiPeriod, 
              stochasticPeriod, 
              kPeriod, 
              dPeriod
            );
            
            if (Array.isArray(stochRSIResult) && stochRSIResult.length > 0) {
              const resultLength = stochRSIResult.length;
              const dataOffset = data.length - resultLength;
              
              // Create a separate pane for Stochastic RSI
              const stochRSISeries = chart.addLineSeries({
                color: indicator.color,
                lineWidth: 1,
                title: `StochRSI K (${rsiPeriod}, ${kPeriod})`,
                priceScaleId: 'stochRSI',
                priceFormat: {
                  type: 'price',
                  precision: 2,
                  minMove: 0.01,
                },
              });
              
              // D line (signal line)
              const dLineSeries = chart.addLineSeries({
                color: '#FF5252',
                lineWidth: 1,
                title: `StochRSI D (${dPeriod})`,
                priceScaleId: 'stochRSI',
              });
              
              // Format data
              const kLineData = stochRSIResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.k
              }));
              
              const dLineData = stochRSIResult.map((item, index) => ({
                time: data[index + dataOffset].time as Time,
                value: item.d
              }));
              
              // Set data
              stochRSISeries.setData(kLineData);
              dLineSeries.setData(dLineData);
              
              // Set scale for the indicator (0-100)
              stochRSISeries.priceScale().applyOptions({
                scaleMargins: {
                  top: 0.1,
                  bottom: 0.1,
                },
                autoScale: true,
              });
              
              // Add overbought/oversold lines
              stochRSISeries.createPriceLine({
                price: 80,
                color: 'red',
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'Overbought',
              });
              
              stochRSISeries.createPriceLine({
                price: 20,
                color: 'green',
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'Oversold',
              });
            }
            
            break;
          }
          // More indicator types can be added here
          default:
            break;
        }
      });
    }

    // Set up resize handler
    window.addEventListener('resize', handleResize);
    
    // Make chart fit the container and show all data
    chart.timeScale().fitContent();

    // Create ResizeObserver to handle chart resizing
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      logChartRenderer('Resizing chart', { width, height });
      chart.resize(width, height);
    });

    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;
    chartRef.current = chart;

    mainSeriesRef.current = mainSeries;
    
    logChartRenderer('Main series created', { 
      chartType, 
      dataPoints: data.length,
      firstPoint: data.length > 0 ? data[0] : null,
      lastPoint: data.length > 0 ? data[data.length - 1] : null 
    });

    return () => {
      logChartRenderer('Cleaning up chart');
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current && container) {
        resizeObserverRef.current.unobserve(container);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, indicators, colors, width, height]);

  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
};

export default Chart; 