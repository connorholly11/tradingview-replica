# TradingView Replica - Comprehensive User Guide

This document provides detailed instructions for using the TradingView replica application, including setup, basic usage, advanced features, and troubleshooting.

## Table of Contents
- [Setup](#setup)
- [Application Interface](#application-interface)
- [Chart Controls](#chart-controls)
- [Technical Indicators](#technical-indicators)
- [Drawing Tools](#drawing-tools)
- [Real-Time Data](#real-time-data)
- [Theme Customization](#theme-customization)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)

## Setup

### Requirements
- Node.js 16.0 or later
- Polygon.io API key (free or paid tier)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps
1. **Clone the Repository:**
   ```
   git clone https://github.com/yourusername/tradingview-replica.git
   cd tradingview-replica
   ```

2. **Install Dependencies:**
   ```
   npm install
   ```

3. **Set Environment Variables:**
   Create a `.env.local` file in the project root with your Polygon.io API key:
   ```
   POLYGON_API_KEY=your_polygon_api_key
   ```

4. **Start the Development Server:**
   ```
   npm run dev
   ```

5. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000`

6. **Build for Production (Optional):**
   ```
   npm run build
   npm start
   ```

## Application Interface

The application interface is divided into several key areas:

### Header Section
- **Logo**: Top-left corner
- **Symbol Search**: Search and select stock symbols
- **Timeframe Selector**: Change the chart timeframe (1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W, 1M)
- **Chart Type Selector**: Switch between candlestick, bar, and line charts
- **Drawing Tools Button**: Toggle drawing tools sidebar
- **Theme Toggle**: Switch between dark and light modes (top-right)

### Symbol Info Bar
Displays relevant information about the selected stock:
- **Symbol and Name**: Stock ticker and full name
- **Price**: Current/last price
- **Change**: Price change and percentage change
- **Key Stats**: Open, High, Low, Close, Volume

### Chart Area
- **Main Chart**: Displays price data according to selected symbol and timeframe
- **Drawing Overlay**: Where drawings and annotations appear
- **Indicators Overlay**: Visual representation of technical indicators
- **Watermark**: TradingView Replica watermark (non-intrusive)

### Indicators Panel
- **Active Indicators**: Shows all active indicators with controls
- **Settings**: Configure parameters for each indicator
- **Visibility Toggle**: Show/hide specific indicators

### Bottom Toolbar
Contains utility buttons for additional features:
- **Grid Toggle**: Show/hide chart grid
- **Maximize**: Expand chart to full screen
- **Settings**: Additional chart settings

## Chart Controls

### Symbol Selection
1. Click on the symbol in the header
2. Search for a symbol in the dropdown search box
3. Select a symbol from the results list or popular symbols

### Timeframe Selection
Click on the desired timeframe button in the header:
- **Intraday**: 1m, 5m, 15m, 30m, 1h, 4h
- **Daily and Up**: 1D, 1W, 1M

### Chart Types
Click on the chart type selector in the header to switch between:
- **Candlestick**: Shows OHLC with candle bodies (default)
- **Bar**: Shows OHLC with bar representation
- **Line**: Shows close prices as a continuous line

### Zooming and Panning
- **Zoom In/Out**: Use the mouse wheel or pinch gesture (touch)
- **Pan**: Click and drag on the chart area
- **Reset Zoom**: Double-click on the chart

### Data Information
Hover over any point on the chart to see:
- **Price Information**: OHLC and volume data
- **Time**: Exact timestamp for the data point
- **Indicator Values**: Values for any active indicators at that point

## Technical Indicators

### Adding Indicators
1. Click on the "Indicators" button in the chart toolbar
2. Select an indicator from the dropdown menu
3. The indicator will be added to the chart immediately
4. Configure settings in the popup dialog or later through the indicators panel

### Managing Indicators
Active indicators are displayed in a panel on the top right of the chart. For each indicator, you can:
- **Toggle Visibility**: Click the eye icon to show/hide
- **Adjust Settings**: Click the gear icon to open settings panel
- **Remove**: Click the X icon to remove the indicator

### Available Indicators

#### Simple Moving Average (SMA)
- **Purpose**: Identifies trend direction by smoothing price fluctuations
- **Default Period**: 20
- **Configuration Options**:
  - Period: Number of candles to include in calculation
  - Color: Line color

#### Exponential Moving Average (EMA)
- **Purpose**: Similar to SMA but gives more weight to recent prices
- **Default Period**: 20
- **Configuration Options**:
  - Period: Number of candles to include in calculation
  - Color: Line color

#### Relative Strength Index (RSI)
- **Purpose**: Measures momentum on a scale from 0 to 100
- **Default Settings**: 
  - Period: 14
  - Overbought level: 70
  - Oversold level: 30
- **Configuration Options**:
  - Period: Number of candles to include in calculation
  - Overbought Level: Upper threshold (typically 70)
  - Oversold Level: Lower threshold (typically 30)
  - Color: Line color

#### Moving Average Convergence Divergence (MACD)
- **Purpose**: Shows the relationship between two moving averages
- **Default Settings**:
  - Fast Period: 12
  - Slow Period: 26
  - Signal Period: 9
- **Configuration Options**:
  - Fast Period: Short-term EMA period
  - Slow Period: Long-term EMA period
  - Signal Period: EMA of MACD line
  - MACD Line Color: Color for the MACD line
  - Signal Line Color: Color for the signal line
  - Histogram Color: Color for the histogram

#### Bollinger Bands
- **Purpose**: Shows price volatility with upper and lower bands
- **Default Settings**:
  - Period: 20
  - Standard Deviation: 2
- **Configuration Options**:
  - Period: SMA period for the middle band
  - Standard Deviation: Multiplier for the bands width
  - Upper Band Color: Color for the upper band
  - Middle Band Color: Color for the middle band
  - Lower Band Color: Color for the lower band

#### Stochastic RSI
- **Purpose**: Combines Stochastic Oscillator and RSI for higher sensitivity
- **Default Settings**:
  - RSI Period: 14
  - Stochastic Period: 14
  - K Period: 3
  - D Period: 3
- **Configuration Options**:
  - RSI Period: Period for the RSI calculation
  - Stochastic Period: Period for the Stochastic calculation
  - K Period: Smoothing for the %K line
  - D Period: Smoothing for the %D line
  - K Line Color: Color for the %K line
  - D Line Color: Color for the %D line

#### Volume Indicator
- **Purpose**: Displays trading volume as a histogram
- **Default Settings**: None (uses chart data)
- **Configuration Options**:
  - Up Color: Color for volume on up candles
  - Down Color: Color for volume on down candles

## Drawing Tools

### Accessing Drawing Tools
1. Click the "Draw" button in the header
2. Select a tool from the drawing toolbar that appears on the left side

### Available Tools
- **Cursor**: Regular selection tool
- **Line**: Draw straight lines
- **Horizontal Line**: Draw horizontal lines at specific price levels
- **Vertical Line**: Draw vertical lines at specific time points
- **Rectangle**: Draw rectangles to highlight areas
- **Circle**: Draw circles or ellipses
- **Arrow**: Draw directional arrows
- **Text**: Add text annotations
- **Fibonacci Retracement**: Draw Fibonacci retracement levels
- **Brush**: Free-hand drawing

### Using Drawing Tools
1. Select a tool from the drawing toolbar
2. Click on the chart to place the starting point
3. Drag to position the endpoint (for applicable tools)
4. Release to complete the drawing

### Editing Drawings
- **Select**: Click on a drawing to select it
- **Move**: Click and drag a selected drawing
- **Resize**: Drag the handles of a selected drawing
- **Delete**: Press Delete or Backspace while a drawing is selected

## Real-Time Data

### WebSocket Connection
- The application automatically connects to Polygon's WebSocket for real-time data when using intraday timeframes (1m, 5m, 15m, 30m)
- A "LIVE" indicator appears in the top-left corner of the chart when connected to real-time data

### Connection Status
- **Green**: Connected and receiving real-time updates
- **Yellow/Orange**: Connected but with delayed data
- **Red**: Disconnected or error

### Reconnecting
If the WebSocket connection is lost:
1. The application will attempt to reconnect automatically
2. If automatic reconnection fails, click on the timeframe button again to force a reconnection
3. If problems persist, check the Troubleshooting section

## Theme Customization

### Switching Themes
Click the theme toggle button in the top-right corner of the header to switch between:
- **Dark Theme**: Dark background with light text (default)
- **Light Theme**: Light background with dark text

### Theme Persistence
- Your theme preference is saved in browser localStorage
- The application will remember your preference between sessions

### System Preference
- On first load, the application checks your system's color scheme preference
- This can be overridden by manually selecting a theme

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `T` | Toggle drawing tools |
| `C` | Switch to candlestick chart |
| `B` | Switch to bar chart |
| `L` | Switch to line chart |
| `Esc` | Cancel current drawing or selection |
| `Delete` | Remove selected drawing |
| `+` | Zoom in |
| `-` | Zoom out |
| `0` (zero) | Reset zoom |

## Advanced Features

### Custom Indicator Settings
Each indicator can be customized with specific parameters:
1. Click the gear icon on an active indicator
2. Adjust the parameters in the settings panel
3. Click "Apply" to update the indicator

### Chart Snapshots
To take a snapshot of the current chart:
1. Set up the chart with desired indicators and drawings
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac) to open the print dialog
3. Select "Save as PDF" or use browser screenshot functionality

### Multiple Timeframe Analysis
To perform multiple timeframe analysis:
1. Analyze patterns on higher timeframes (1D, 1W)
2. Switch to lower timeframes (1h, 15m) to find entry/exit points
3. Use indicators consistently across timeframes

## Troubleshooting

### API Connection Issues
If you encounter issues with the Polygon API:

1. **Check API Key**:
   - Verify your API key is correct in the `.env.local` file
   - Restart the development server after changing the key

2. **API Limits**:
   - Free tier Polygon accounts have limited requests (5/minute)
   - If you see "Using sample data" messages, you've hit rate limits
   - Wait a minute before trying again or upgrade to a paid plan

3. **Network Issues**:
   - Check your internet connection
   - Try accessing the Polygon API documentation website to verify connectivity

### WebSocket Connection Issues
If real-time data is not working:

1. **Check Connection Status**:
   - Look for the "LIVE" indicator in the chart
   - Check browser console for WebSocket connection messages

2. **Force Reconnection**:
   - Change timeframe to a different value and back
   - Refresh the page (may require re-selecting symbol)

3. **WebSocket Compatibility**:
   - Ensure your network allows WebSocket connections
   - Some corporate firewalls may block WebSockets

### Chart Rendering Issues
If the chart doesn't render correctly:

1. **Clear Browser Cache**:
   - Clear your browser cache and reload the page
   - Try a different browser

2. **Check Console Errors**:
   - Open browser developer tools (F12 or Ctrl+Shift+I)
   - Check the console for error messages

3. **GPU Acceleration**:
   - Enable hardware acceleration in your browser settings
   - Update your graphics drivers

### Data Quality Issues
If chart data appears incorrect:

1. **Symbol Verification**:
   - Verify the symbol is correct (e.g., AAPL, not APPL)
   - Some symbols may not be available in the free Polygon tier

2. **Timeframe Adjustment**:
   - Some timeframes may have limited data
   - Try a different timeframe

3. **Sample Data**:
   - If seeing "Using sample data" messages, the application is using fallback data
   - This may not reflect actual market prices

## Performance Optimization

### Browser Performance
For optimal performance:
- Use a modern browser (Chrome, Firefox, Edge)
- Close unnecessary tabs and applications
- Enable hardware acceleration in browser settings

### Data Considerations
- Limit the number of active indicators (3-5 recommended)
- Higher timeframes (1D, 1W) require less processing than minute-by-minute data
- Real-time data (WebSocket) requires more resources than historical data

### Mobile Devices
When using on mobile devices:
- Prefer Wi-Fi connections over cellular data
- Limit active indicators to maintain performance
- Consider using larger timeframes to reduce data processing 