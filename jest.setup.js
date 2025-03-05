// Import Jest-DOM extensions
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/'
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Polyfill for TextEncoder/TextDecoder used in Node.js environments
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Mock objects that don't exist in JSDOM
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof IntersectionObserver === 'undefined') {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock WebSocket for tests
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    
    // Call onopen asynchronously to simulate connection
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }
  
  send() {}
  close() {}
  
  // Event handlers that will be set by the code
  onopen = null;
  onmessage = null;
  onclose = null;
  onerror = null;
};

// Constants
global.WebSocket.CONNECTING = 0;
global.WebSocket.OPEN = 1;
global.WebSocket.CLOSING = 2;
global.WebSocket.CLOSED = 3;

// Fail tests when React has an error
console.error = (message) => {
  if (
    message.includes('Error: Uncaught [') ||
    message.includes('act(...)') ||
    message.includes('Warning: ReactDOM.render')
  ) {
    throw new Error(message);
  }
};

// Mock for lightweight-charts module
jest.mock('lightweight-charts', () => ({
  createChart: jest.fn().mockReturnValue({
    applyOptions: jest.fn(),
    resize: jest.fn(),
    timeScale: jest.fn().mockReturnValue({
      fitContent: jest.fn(),
      applyOptions: jest.fn(),
      scrollToPosition: jest.fn(),
      subscribeVisibleTimeRangeChange: jest.fn(),
      getVisibleRange: jest.fn().mockReturnValue({ from: 0, to: 0 }),
    }),
    priceScale: jest.fn().mockReturnValue({
      applyOptions: jest.fn(),
    }),
    addCandlestickSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn(),
    }),
    addBarSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn(),
    }),
    addLineSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn(),
    }),
    addHistogramSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn(),
    }),
    subscribeCrosshairMove: jest.fn(),
    unsubscribeCrosshairMove: jest.fn(),
    remove: jest.fn(),
  }),
  CrosshairMode: {
    Normal: 'normal',
    Magnet: 'magnet',
  },
  LineStyle: {
    Solid: 0,
    Dotted: 1,
    Dashed: 2,
    LargeDashed: 3,
    SparseDotted: 4,
  },
})); 