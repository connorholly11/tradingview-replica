# TradingView Replica - Developer Documentation

This document provides technical documentation for developers working on the TradingView replica project. It covers architecture, component APIs, data flows, and implementation guidelines.

## Table of Contents
- [Project Architecture](#project-architecture)
- [Core Components](#core-components)
- [Data Services](#data-services)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Logging System](#logging-system)
- [Technical Indicators](#technical-indicators)
- [Styling Guidelines](#styling-guidelines)
- [Performance Considerations](#performance-considerations)
- [Testing](#testing)
- [Extension Points](#extension-points)

## Project Architecture

### Directory Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── page.tsx        # Main application page
│   ├── layout.tsx      # Root layout component
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── chart/          # Chart-related components
│   ├── header/         # Header components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── lib/                # Shared utilities and services
│   ├── apiService.ts          # Polygon API integration
│   ├── websocketService.ts    # WebSocket connection management
│   ├── indicatorsService.ts   # Technical indicators calculations
│   └── sampleData.ts          # Fallback sample data
└── types/              # TypeScript type definitions
```

### Component Hierarchy

```
App (page.tsx)
├── Header
│   ├── SymbolSearch
│   ├── TimeframeSelector
│   ├── ChartTypeSelector
│   └── ThemeToggle
├── SymbolInfo
└── ChartContainer
    ├── ChartToolbar
    │   ├── SymbolSelector
    │   ├── TimeframeSelector
    │   └── Indicators
    ├── Chart
    │   └── (Lightweight Charts instance)
    ├── ActiveIndicators
    └── DrawingToolbar
```

### Data Flow

1. User interactions (symbol/timeframe changes) trigger state updates in parent components
2. State changes propagate down to child components via props
3. Data fetching occurs in container components (ChartContainer)
4. Rendering components (Chart) receive processed data and render visuals
5. Event handlers bubble up actions to parent components

## Core Components

### Main Page Component (`page.tsx`)

**State:**
- `currentSymbol` - Currently selected symbol
- `currentTimeframe` - Selected timeframe
- `chartType` - Selected chart type ('candle', 'bar', 'line')
- `showDrawingTools` - Drawing tools visibility toggle

**Key Methods:**
- `handleSymbolChange(symbol)` - Updates symbol and simulates price data
- `handleTimeframeChange(timeframe)` - Updates timeframe
- `handleChartTypeChange(type)` - Updates chart type
- `toggleDrawingTools()` - Toggles drawing tools visibility

### ChartContainer Component

**Props:**
```typescript
interface ChartContainerProps {
  symbol?: string;
  interval?: string;
  chartType?: 'candle' | 'bar' | 'line';
}
```

**State:**
- `chartData` - Array of OHLC price data
- `isLoading` - Loading state flag
- `error` - Error message if data fetch fails
- `warning` - Warning message (e.g., delayed data)
- `activeIndicators` - Array of active technical indicators
- `showDrawingTools` - Drawing tools visibility flag
- `isLiveData` - WebSocket connection status

**Key Methods:**
- `fetchData()` - Fetches historical data from Polygon API
- `handleRealtimeUpdate(update)` - Processes WebSocket updates
- `connectToWebSocket()` - Establishes WebSocket connection
- `disconnectWebSocket()` - Closes WebSocket connection
- `handleAddIndicator(indicator)` - Adds a technical indicator
- `handleRemoveIndicator(id)` - Removes a technical indicator
- `handleUpdateIndicator(id, updates)` - Updates indicator settings

**Exposed through ref:**
- `toggleDrawingTools()` - Method to toggle drawing tools

### Chart Component

**Props:**
```typescript
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
```

**Implementation Details:**
- Uses lightweight-charts library to render the chart
- Uses `useRef` to maintain references to chart instances
- Manages resize observers for responsive rendering
- Handles chart type changes by recreating the series
- Creates separate series for each indicator
- Responsive to data and indicator changes

## Data Services

### API Service (`apiService.ts`)

**Key Functions:**
- `fetchPolygonAggregates(ticker, multiplier, timespan, from, to, adjusted)`
  - Fetches historical OHLC data from Polygon
  - Returns data, error, and warning in a single object
  - Falls back to sample data on API errors
  
- `mapTimeframeToPolygonParams(timeframe)`
  - Converts UI timeframe strings to Polygon API parameters
  
- `getTimeframeDateRange(timeframe)`
  - Returns appropriate date range based on timeframe

**Data Types:**
```typescript
export interface ChartData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
```

### WebSocket Service (`websocketService.ts`)

**Service Pattern:**
- Singleton instance exported for app-wide use
- Manages WebSocket connection lifecycle
- Handles message parsing and event callbacks

**Key Methods:**
- `init()` - Initializes the WebSocket connection
- `connectToSymbol(symbol)` - Subscribes to a specific symbol
- `disconnect()` - Closes the WebSocket connection

**Event Callbacks:**
- `onMessage` - Called when a valid price update is received
- `onConnect` - Called when connection is established
- `onDisconnect` - Called when connection is closed
- `onError` - Called when an error occurs

**Implementation Details:**
- Implements reconnection logic with exponential backoff
- Validates incoming messages against expected schema
- Includes comprehensive logging of connection events

### Sample Data Service (`sampleData.ts`)

**Key Functions:**
- `getSampleData(ticker)` - Returns fallback data for a specific ticker
- `generateSampleData(count, basePrice, volatility)` - Generates random price data

## State Management

The application uses React's built-in state management with hooks:

### Component-Level State
- Each component manages its own isolated state with `useState`
- State that affects multiple components is lifted to parent components

### Ref Forwarding
- `forwardRef` is used to expose methods from child to parent components
- `useImperativeHandle` defines which methods are exposed through refs

### Data Flow Patterns
- **Prop Drilling** - Data passes down through props
- **Callback Props** - Child components call parent-provided functions
- **Ref Methods** - Parent components call methods on child refs

## API Integration

### Polygon.io API

**Authentication:**
- API key provided through environment variable
- Bearer token sent with each request

**Endpoints Used:**
- Aggregates (Bars): `/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}`
- WebSocket: `wss://socket.polygon.io/stocks`

**Error Handling:**
1. Network errors are caught and logged
2. API errors (non-200 responses) are parsed for error messages
3. Status codes other than 'OK' or 'DELAYED' trigger fallback to sample data
4. Empty results arrays trigger fallback to sample data

**Rate Limiting:**
- Free tier is limited to 5 requests per minute
- Application implements fallback to sample data when rate limited

### WebSocket Integration

**Connection Flow:**
1. Initialize connection to Polygon WebSocket
2. Authenticate with API key
3. Subscribe to specific symbols
4. Process incoming messages

**Message Types:**
- `T` - Trades
- `Q` - Quotes
- `AM` - Aggregate Minute
- `A` - Aggregate Second

**Message Handling:**
1. Parse JSON message
2. Validate message structure
3. Extract OHLCV data
4. Update chart with new data

## Logging System

The application implements a comprehensive logging system throughout the codebase:

### Logging Functions

Each component has a dedicated logging function following this pattern:

```typescript
const logComponent = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[Component ${timestamp}]`, action, details || '');
};
```

### Logging Conventions

1. **Action Names** - Clear, consistent action names across components
   - 'Data Fetched', 'Symbol Changed', 'WebSocket Connected', etc.

2. **Context Data** - Include relevant state and parameters
   - Symbol, timeframe, data counts, etc.

3. **Timestamps** - ISO format timestamps with each log entry

4. **Component Identification** - Component name included in each log

5. **Error Details** - Full error details for troubleshooting

### Log Categories

- **User Interactions** - Symbol changes, timeframe changes, etc.
- **Data Operations** - Fetching, processing, and updating data
- **WebSocket Events** - Connection, messages, disconnection
- **Rendering Events** - Chart creation, updates, and disposal
- **Error Conditions** - API errors, WebSocket errors, etc.

## Technical Indicators

### Indicator Service (`indicatorsService.ts`)

**Data Extraction Functions:**
- `getPriceData(data)` - Extract prices from OHLC data
- `getHighData(data)` - Extract high prices
- `getLowData(data)` - Extract low prices
- `getVolumeData(data)` - Extract volume data
- `getOpenData(data)` - Extract open prices
- `getCloseData(data)` - Extract close prices

**Indicator Calculation Functions:**

1. **Simple Moving Average (SMA)**
   ```typescript
   calculateSMA(data: ChartData[], period: number = 20): number[]
   ```

2. **Exponential Moving Average (EMA)**
   ```typescript
   calculateEMA(data: ChartData[], period: number = 20): number[]
   ```

3. **Relative Strength Index (RSI)**
   ```typescript
   calculateRSI(data: ChartData[], period: number = 14): number[]
   ```

4. **Moving Average Convergence Divergence (MACD)**
   ```typescript
   calculateMACD(
     data: ChartData[], 
     fastPeriod: number = 12, 
     slowPeriod: number = 26, 
     signalPeriod: number = 9
   ): MACDResult[]
   ```

5. **Bollinger Bands**
   ```typescript
   calculateBollingerBands(
     data: ChartData[], 
     period: number = 20, 
     stdDev: number = 2
   ): BollingerBandsResult[]
   ```

6. **Stochastic RSI**
   ```typescript
   calculateStochasticRSI(
     data: ChartData[], 
     rsiPeriod: number = 14, 
     stochasticPeriod: number = 14, 
     kPeriod: number = 3, 
     dPeriod: number = 3
   ): StochasticRSIResult[]
   ```

7. **On-Balance Volume (OBV)**
   ```typescript
   calculateOBV(data: ChartData[]): number[]
   ```

### Indicator Configuration

**Indicator Config Interface:**
```typescript
interface IndicatorConfig {
  id: string;       // Unique identifier
  type: string;     // Indicator type ('sma', 'rsi', etc.)
  name: string;     // Display name
  color: string;    // Line color
  visible: boolean; // Visibility flag
  settings: Record<string, number>; // Indicator-specific settings
  data?: number[];  // Calculated indicator values
}
```

**Usage in Components:**
1. User selects an indicator type and configuration
2. Parent component creates an `IndicatorConfig` object
3. The object is added to the `activeIndicators` array
4. `ChartContainer` calculates indicator values using `indicatorsService`
5. `Chart` renders the indicator using lightweight-charts

## Styling Guidelines

### CSS Architecture

1. **Tailwind CSS**
   - Primary styling approach
   - Utility-first methodology
   - Custom theme configuration in `tailwind.config.js`

2. **Global Styles**
   - Base styles in `globals.css`
   - CSS variables for theming
   - Media queries for responsiveness

3. **Component Styling**
   - Tailwind classes directly in components
   - Consistent class ordering (layout, spacing, colors, etc.)
   - BEM-like naming for complex components

### Theme System

The application implements a theme system with:

1. **CSS Variables**
   - `--background-color`
   - `--text-color`
   - And other theme-specific variables

2. **Theme Toggle**
   - Updates CSS variables
   - Updates DOM classes
   - Persists preference in localStorage

3. **System Preference Detection**
   - Uses `prefers-color-scheme` media query
   - Falls back to dark theme by default

## Performance Considerations

### Rendering Optimization

1. **Component Memoization**
   - Use `React.memo` for pure components
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for event handlers passed as props

2. **Lightweight-Charts Performance**
   - Use appropriate data point density
   - Implement data thinning for large datasets
   - Use `requestAnimationFrame` for animations

3. **State Updates**
   - Batch state updates where possible
   - Use functional updates for derived state

### Data Handling

1. **WebSocket Updates**
   - Limit unnecessary re-renders
   - Process data efficiently before updating state
   - Implement debouncing for high-frequency updates

2. **Large Datasets**
   - Implement virtual scrolling for large historical datasets
   - Use data thinning algorithms for zoomed-out views
   - Load data incrementally as needed

3. **Indicator Calculations**
   - Cache results where possible
   - Calculate only visible indicators
   - Implement lazy evaluation

## Testing

### Unit Testing

1. **Component Tests**
   - Test component rendering
   - Test state changes
   - Test user interactions

2. **Service Tests**
   - Test API service functions
   - Test WebSocket service methods
   - Test indicator calculations

3. **Utility Tests**
   - Test helper functions
   - Test data transformations

### Integration Testing

1. **Component Integration**
   - Test parent-child component interactions
   - Test data flow between components
   - Test ref forwarding and method calls

2. **API Integration**
   - Test Polygon API integration
   - Test error handling and fallbacks
   - Test WebSocket connection and message handling

## Extension Points

### Adding New Indicators

1. Create calculation function in `indicatorsService.ts`
2. Add indicator type to `IndicatorType` enum in `Indicators.tsx`
3. Add indicator definition to `INDICATOR_DEFINITIONS` in `Indicators.tsx`
4. Implement rendering logic in `Chart.tsx`

### Adding New Chart Types

1. Add new chart type to chart type enum
2. Implement formatting function in `formatDataForChartType`
3. Update chart creation logic in `Chart.tsx`
4. Add UI control in `ChartTypeSelector.tsx`

### Adding New Drawing Tools

1. Add new tool type to `DrawingTool` enum in `DrawingToolbar.tsx`
2. Add tool button to `DrawingToolbar` component
3. Implement tool behavior in chart drawing logic

### Supporting New Data Sources

1. Create new service file (e.g., `yahooFinanceService.ts`)
2. Implement data fetching and transformation functions
3. Create adapter to convert to standard `ChartData` format
4. Add source selection UI if multiple sources should be available 