// Import Jest DOM extensions
require('@testing-library/jest-dom');

// Mock the next/navigation functions
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock the ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console.error to fail tests when React errors occur
const originalConsoleError = console.error;
console.error = (...args) => {
  // Fail tests if React specific errors are found
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: An update to') ||
      message.includes('Warning: Can\'t perform a React state update'))
  ) {
    throw new Error(message);
  }
  originalConsoleError(...args);
};

// Mock the lightweight-charts module
jest.mock('lightweight-charts', () => ({
  createChart: jest.fn().mockReturnValue({
    applyOptions: jest.fn(),
    resize: jest.fn(),
    addCandlestickSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn(),
    }),
    addLineSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn(),
    }),
    addBarSeries: jest.fn().mockReturnValue({
      setData: jest.fn(),
      applyOptions: jest.fn(),
      update: jest.fn(),
    }),
    timeScale: jest.fn().mockReturnValue({
      fitContent: jest.fn(),
      applyOptions: jest.fn(),
    }),
    subscribeCrosshairMove: jest.fn(),
    unsubscribeCrosshairMove: jest.fn(),
    remove: jest.fn(),
  }),
  UTCTimestamp: jest.fn(),
})); 