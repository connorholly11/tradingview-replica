// Core enum types exported for use across the application
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  TRADER = 'TRADER',
  SUPPORT = 'SUPPORT',
  ANALYST = 'ANALYST'
}

export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  VIOLATED = 'VIOLATED',
  COMPLETED = 'COMPLETED',
  FUNDED = 'FUNDED',
  CLOSED = 'CLOSED'
}

export enum TradeSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum DrawdownType {
  STATIC = 'STATIC',
  END_OF_DAY = 'END_OF_DAY'
}

export enum ViolationType {
  DAILY_LOSS = 'DAILY_LOSS',
  MAX_LOSS = 'MAX_LOSS',
  DRAWDOWN = 'DRAWDOWN',
  PROFIT_TARGET = 'PROFIT_TARGET',
  POSITION_SIZE = 'POSITION_SIZE',
  END_OF_DAY_DRAWDOWN = 'END_OF_DAY_DRAWDOWN'
}

export enum ResolutionType {
  WARNING = 'WARNING',
  TERMINATED = 'TERMINATED',
  OVERRIDE = 'OVERRIDE'
}

export enum AdminAction {
  USER_VERIFY = 'USER_VERIFY',
  USER_SUSPEND = 'USER_SUSPEND',
  ACCOUNT_CREATE = 'ACCOUNT_CREATE',
  ACCOUNT_LOCK = 'ACCOUNT_LOCK',
  ACCOUNT_RESET = 'ACCOUNT_RESET',
  VIOLATION_RESOLVE = 'VIOLATION_RESOLVE',
  PROGRAM_UPDATE = 'PROGRAM_UPDATE'
}

/**
 * No STOCK references here; keep or remove others as needed
 */
export enum InstrumentType {
  FUTURES = 'FUTURES',
  FOREX = 'FOREX',
  CRYPTO = 'CRYPTO',
  INDEX = 'INDEX',
  OPTION = 'OPTION',
  ETF = 'ETF'
}

export enum AlertType {
  PRICE = 'PRICE',
  INDICATOR = 'INDICATOR',
  VOLUME = 'VOLUME',
  VOLATILITY = 'VOLATILITY',
  PATTERN = 'PATTERN',
  CUSTOM = 'CUSTOM'
}

// Chart-related types
export type ChartType = 'candle' | 'bar' | 'line' | 'area';
export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

export interface ChartData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Technical indicator types
export interface IndicatorConfig {
  id: string;
  type: string;
  name: string;
  color: string;
  visible: boolean;
  settings: Record<string, number>; 
  data?: number[];
}

// TradingView platform interface types
export interface WatchlistItem {
  id: string;
  symbolId: string;
  ticker: string;
  name: string;
  price?: number;
  change?: number;
  changePercent?: number;
  type: InstrumentType;
  notes?: string;
}

export interface ChartLayoutConfig {
  id: string;
  name: string;
  chartType: ChartType;
  timeframe: TimeFrame;
  indicators: IndicatorConfig[];
  drawingTools: any[];
  gridConfig: {
    showGrid: boolean;
    showAxis: boolean;
    showLabels: boolean;
  };
  colorConfig: {
    background: string;
    text: string;
    grid: string;
    upCandle: string;
    downCandle: string;
  };
}

// User preferences type
export interface TradingPreferences {
  defaultChartType: ChartType;
  defaultTimeframe: TimeFrame;
  defaultWatchlist?: string;
  defaultLayout?: string;
  colorTheme: 'light' | 'dark' | 'custom';
  notifications: {
    tradeExecutions: boolean;
    priceAlerts: boolean;
    accountUpdates: boolean;
    dailySummary: boolean;
  };
  customColors?: Record<string, string>;
  shortcuts?: Record<string, string>;
}

// Alert condition types
export interface PriceAlertCondition {
  type: 'crossAbove' | 'crossBelow' | 'equals';
  price: number;
}

export interface IndicatorAlertCondition {
  indicator: string;
  settings: Record<string, number>;
  condition: 'crossAbove' | 'crossBelow' | 'equals';
  value: number;
}

export type AlertCondition = PriceAlertCondition | IndicatorAlertCondition; 