import { WebSocketService } from '../src/lib/websocketService';

// Define types for event handlers
interface WebSocketEvent {
  type: string;
  data?: string;
}

// Mock the WebSocket
const mockSend = jest.fn();
const mockClose = jest.fn();

// Store event handlers for simulation
let openHandler: ((event: WebSocketEvent) => void) | null = null;
let closeHandler: ((event: WebSocketEvent) => void) | null = null;
let messageHandler: ((event: WebSocketEvent) => void) | null = null;
let errorHandler: ((event: WebSocketEvent) => void) | null = null;

// Mock implementation
class MockWebSocket {
  constructor(public url: string) {
    // Simulate connection after a short delay
    setTimeout(() => {
      if (openHandler) openHandler({ type: 'open' });
    }, 0);
  }

  send = mockSend;
  close = mockClose;

  // Store handlers for later simulation
  set onopen(handler: ((event: WebSocketEvent) => void) | null) {
    openHandler = handler;
  }

  set onclose(handler: ((event: WebSocketEvent) => void) | null) {
    closeHandler = handler;
  }

  set onmessage(handler: ((event: WebSocketEvent) => void) | null) {
    messageHandler = handler;
  }

  set onerror(handler: ((event: WebSocketEvent) => void) | null) {
    errorHandler = handler;
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

// Helper to simulate WebSocket messages
function simulateWebSocketMessage(data: Record<string, unknown>): void {
  if (messageHandler) {
    messageHandler({ data: JSON.stringify(data), type: 'message' });
  }
}

// Helper to simulate WebSocket errors
function simulateWebSocketError(): void {
  if (errorHandler) {
    errorHandler({ type: 'error' });
  }
}

// Helper to simulate WebSocket close
function simulateWebSocketClose(): void {
  if (closeHandler) {
    closeHandler({ type: 'close' });
  }
}

describe('Polygon WebSocket Service', () => {
  let mockMessageHandler: jest.Mock;
  let mockConnectHandler: jest.Mock;
  let mockDisconnectHandler: jest.Mock;
  let mockErrorHandler: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockSend.mockClear();
    mockClose.mockClear();
    
    // Create mock handlers
    mockMessageHandler = jest.fn();
    mockConnectHandler = jest.fn();
    mockDisconnectHandler = jest.fn();
    mockErrorHandler = jest.fn();
    
    // Set handlers
    polygonWebSocketService.onMessage = mockMessageHandler;
    polygonWebSocketService.onConnect = mockConnectHandler;
    polygonWebSocketService.onDisconnect = mockDisconnectHandler;
    polygonWebSocketService.onError = mockErrorHandler;
  });

  afterEach(() => {
    // Clean up
    polygonWebSocketService.disconnect();
  });

  it('should successfully connect to WebSocket', () => {
    // Initialize the connection
    polygonWebSocketService.init();
    
    // Verify that connect handler was called
    expect(mockConnectHandler).toHaveBeenCalled();
  });

  it('should handle authentication', () => {
    // Initialize the connection
    polygonWebSocketService.init();
    
    // Verify that authentication message was sent
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('auth'));
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('apiKey'));
  });

  it('should subscribe to symbols', () => {
    // Initialize the connection
    polygonWebSocketService.init();
    
    // Reset mock to clear authentication calls
    mockSend.mockClear();
    
    // Subscribe to a symbol
    polygonWebSocketService.connectToSymbol('AAPL');
    
    // Verify that subscription message was sent
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('subscribe'));
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('AAPL'));
  });

  it('should process valid price update messages', () => {
    // Initialize the connection
    polygonWebSocketService.init();
    
    // Simulate receiving a valid message
    const validMessage = {
      ev: 'AM', // Aggregate Minute
      sym: 'AAPL',
      v: 10000, // Volume
      o: 150.1, // Open
      c: 151.2, // Close
      h: 152.3, // High
      l: 149.8, // Low
      t: 1622548800000, // Timestamp
    };
    
    simulateWebSocketMessage(validMessage);
    
    // Verify message handler was called with transformed data
    expect(mockMessageHandler).toHaveBeenCalledWith({
      t: validMessage.t,
      o: validMessage.o,
      h: validMessage.h,
      l: validMessage.l,
      c: validMessage.c,
      v: validMessage.v
    });
  });

  it('should handle invalid messages gracefully', () => {
    // Initialize the connection
    polygonWebSocketService.init();
    
    // Simulate receiving an invalid message
    const invalidMessage = { status: 'error', message: 'Invalid request' };
    simulateWebSocketMessage(invalidMessage);
    
    // Message handler should not be called for invalid messages
    expect(mockMessageHandler).not.toHaveBeenCalled();
  });

  it('should handle connection errors', () => {
    // Initialize the connection
    polygonWebSocketService.init();
    
    // Simulate an error
    simulateWebSocketError();
    
    // Verify error handler was called
    expect(mockErrorHandler).toHaveBeenCalled();
  });

  it('should handle disconnection', () => {
    // Initialize the connection
    polygonWebSocketService.init();
    
    // Simulate WebSocket close
    simulateWebSocketClose();
    
    // Verify disconnect handler was called
    expect(mockDisconnectHandler).toHaveBeenCalled();
  });
}); 