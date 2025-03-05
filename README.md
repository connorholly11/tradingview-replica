# TradingView Replica

A modern, responsive trading platform inspired by TradingView, built with Next.js, TypeScript, and Tailwind CSS. This application features real-time stock data, technical indicators, and drawing tools.

![TradingView Replica Screenshot](public/screenshot.png)

## Features

- **Interactive Charts**: Built with lightweight-charts library for high-performance rendering
- **Real-Time Data**: WebSocket integration with Polygon.io for live market updates
- **Technical Indicators**: SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic RSI, and Volume
- **Drawing Tools**: Lines, rectangles, arrows, text, fibonacci retracement, and more
- **Multiple Chart Types**: Candlestick, Bar, and Line charts
- **Comprehensive Logging**: Structured logging throughout the application for debugging
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Customizable theme with persistence

## Technology Stack

- **Framework**: Next.js 14 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charting**: TradingView's lightweight-charts
- **State Management**: React's useState/useEffect hooks
- **API Integration**: Polygon.io REST API and WebSockets
- **Technical Analysis**: Custom implementations and technicalindicators library

## Getting Started

### Prerequisites

- Node.js 16.0 or later
- Polygon.io API key (free tier works for testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tradingview-replica.git
   cd tradingview-replica
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Polygon.io API key:
   ```
   POLYGON_API_KEY=your_polygon_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

The application follows a modular architecture organized by feature:

```
src/
├── app/                # Next.js App Router pages
│   ├── page.tsx        # Main application page
│   ├── layout.tsx      # Root layout component
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── chart/          # Chart-related components
│   │   ├── Chart.tsx              # Core chart rendering with lightweight-charts
│   │   ├── ChartContainer.tsx     # Container with data fetching & WebSocket
│   │   ├── ChartToolbar.tsx       # Toolbar with symbol and timeframe controls
│   │   ├── ActiveIndicators.tsx   # UI for managing active indicators
│   │   ├── Indicators.tsx         # Technical indicators selector
│   │   ├── DrawingToolbar.tsx     # Drawing tools interface
│   │   └── SymbolInfo.tsx         # Price information display
│   ├── header/         # Header components
│   │   ├── Header.tsx             # Main header component
│   │   ├── SymbolSearch.tsx       # Symbol search with dropdown
│   │   ├── TimeframeSelector.tsx  # Timeframe selection buttons
│   │   ├── ChartTypeSelector.tsx  # Chart type toggle (candle/bar/line)
│   │   └── ThemeToggle.tsx        # Dark/light mode toggle
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── lib/                # Shared utilities and services
│   ├── apiService.ts          # Polygon API integration
│   ├── websocketService.ts    # WebSocket connection management
│   ├── indicatorsService.ts   # Technical indicators calculations
│   └── sampleData.ts          # Fallback sample data
└── types/              # TypeScript type definitions
```

## Core Components

### Chart System

- **Chart Component** (`Chart.tsx`): Core rendering using lightweight-charts library
- **ChartContainer** (`ChartContainer.tsx`): Manages data fetching, WebSocket integration, and state
- **Drawing Tools** (`DrawingToolbar.tsx`): Provides drawing capabilities on the chart

### Technical Indicators

The application supports various technical indicators implemented in `indicatorsService.ts`:

- **Simple Moving Average (SMA)**: Average price over a specific period
- **Exponential Moving Average (EMA)**: Weighted average giving more importance to recent prices
- **Relative Strength Index (RSI)**: Momentum oscillator measuring speed and change of price movements
- **Moving Average Convergence Divergence (MACD)**: Trend-following momentum indicator with signal line and histogram
- **Bollinger Bands**: Volatility indicator with upper, middle, and lower bands
- **Stochastic RSI**: Oscillator combining Stochastic and RSI for higher sensitivity
- **On-Balance Volume (OBV)**: Volume-based indicator showing buying/selling pressure

### Data Integration

#### REST API

The application fetches historical data through Polygon.io's REST API:

- **Endpoint**: `/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}`
- **Implementation**: `fetchPolygonAggregates()` in `apiService.ts`
- **Error Handling**: Falls back to sample data when API limits are reached or errors occur
- **Status Handling**: Handles both 'OK' and 'DELAYED' status responses

#### WebSocket Integration

Real-time data is received through Polygon.io WebSockets:

- **Service**: `websocketService.ts` manages connection lifecycle
- **Events**: Handles connection, disconnection, errors, and message processing
- **Reconnection**: Implements exponential backoff for connection retries
- **Message Parsing**: Validates and transforms incoming messages to chart data format

### Logging System

Comprehensive logging is implemented throughout the application:

- **Component-specific Loggers**: Each component has its own logger function
- **Structured Format**: All logs include timestamps and component identifiers
- **Event Categories**: Logs are categorized by action types (data fetching, user interactions, etc.)
- **Data Context**: Relevant context data is included with each log entry

## Polygon API Integration

This project uses Polygon.io's REST API to fetch stock data and WebSockets for real-time updates.

### API Key

The application uses a Polygon.io API key for authentication. You can sign up for a free API key at [polygon.io](https://polygon.io/).

### Available Endpoints

The application currently uses the following Polygon endpoints:

- **Aggregates (Bars)**: `/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}`
  - Used to get OHLCV (Open, High, Low, Close, Volume) data for charts
- **WebSockets**: `wss://socket.polygon.io/stocks`
  - Used for real-time updates

### Status Handling

The Polygon API may return different status values:
- `OK`: The request was successful
- `DELAYED`: The data is delayed (common with free tier)
- `ERROR`: An error occurred (application falls back to sample data)

### Date Range Adjustments

The application automatically adjusts the date range based on the selected timeframe:

- **Short timeframes** (1m, 5m): Last 24 hours
- **Medium timeframes** (15m, 30m): Last 7 days
- **Hour timeframes** (1h, 4h): Last 30-60 days
- **Day timeframes** (1D): Last year
- **Week/Month timeframes** (1W, 1M): Multiple years

## Custom Theme System

The application includes a theme system with dark and light modes:

- **ThemeToggle Component**: UI control for switching themes
- **LocalStorage Persistence**: User preferences are saved between sessions
- **CSS Variables**: Theme colors are managed through CSS variables
- **Prefers-Color-Scheme**: Initial theme respects user's system preference

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `T` | Toggle drawing tools |
| `C` | Switch to candlestick chart |
| `B` | Switch to bar chart |
| `L` | Switch to line chart |
| `Esc` | Cancel current drawing |

## Known Limitations

- Free Polygon.io API has request limits (5 requests/minute) and delayed data
- WebSocket connection drops require manual reconnection in some cases
- Some advanced features of TradingView are not implemented (alerts, screeners)
- Limited historical data for some timeframes and symbols

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code structure and naming conventions
2. Add comprehensive logging for new features
3. Ensure responsive design for all UI components
4. Include appropriate error handling and fallbacks
5. Write descriptive commit messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Polygon.io](https://polygon.io/) for the market data API
- [lightweight-charts](https://github.com/tradingview/lightweight-charts) for the charting library
- [TradingView](https://www.tradingview.com/) for the inspiration
