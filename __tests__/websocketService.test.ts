import coinbaseWebSocketService from '../src/lib/coinbaseWebSocketService';

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

describe('Coinbase WebSocket Service', () => {
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
    coinbaseWebSocketService.onMessage = mockMessageHandler;
    coinbaseWebSocketService.onConnect = mockConnectHandler;
    coinbaseWebSocketService.onDisconnect = mockDisconnectHandler;
    coinbaseWebSocketService.onError = mockErrorHandler;
  });

  afterEach(() => {
    // Clean up
    coinbaseWebSocketService.disconnect();
  });

  it('should successfully connect to WebSocket', () => {
    // Initialize the connection
    coinbaseWebSocketService.init();
    
    // Verify that connect handler was called
    expect(mockConnectHandler).toHaveBeenCalled();
  });

  it('should subscribe to symbols', () => {
    // Initialize the connection
    coinbaseWebSocketService.init();
    
    // Reset mock to clear authentication calls
    mockSend.mockClear();
    
    // Subscribe to a symbol
    coinbaseWebSocketService.connectToSymbol('BTC-USD');
    
    // Verify that subscription message was sent
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('subscribe'));
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('BTC-USD'));
  });

  it('should process valid price update messages', () => {
    // Initialize the connection
    coinbaseWebSocketService.init();
    
    // Simulate receiving a valid message
    const validMessage = {
      type: 'ticker',
      product_id: 'BTC-USD',
      price: '42500.75',
      time: '2023-03-30T12:34:56.789Z',
      side: 'buy',
      sequence: 12345678,
      t: 1648635296789 // Unix timestamp
    };
    
    simulateWebSocketMessage(validMessage);
    
    // Verify message handler was called with transformed data
    expect(mockMessageHandler).toHaveBeenCalledWith(expect.objectContaining({
      price: 42500.75,
      t: validMessage.t
    }));
  });

  it('should handle invalid messages gracefully', () => {
    // Initialize the connection
    coinbaseWebSocketService.init();
    
    // Simulate receiving an invalid message
    const invalidMessage = { status: 'error', message: 'Invalid request' };
    simulateWebSocketMessage(invalidMessage);
    
    // Message handler should not be called for invalid messages
    expect(mockMessageHandler).not.toHaveBeenCalled();
  });

  it('should handle connection errors', () => {
    // Initialize the connection
    coinbaseWebSocketService.init();
    
    // Simulate an error
    simulateWebSocketError();
    
    // Verify error handler was called
    expect(mockErrorHandler).toHaveBeenCalled();
  });

  it('should handle disconnection', () => {
    // Initialize the connection
    coinbaseWebSocketService.init();
    
    // Simulate WebSocket close
    simulateWebSocketClose();
    
    // Verify disconnect handler was called
    expect(mockDisconnectHandler).toHaveBeenCalled();
  });
}); 