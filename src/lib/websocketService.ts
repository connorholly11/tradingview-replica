'use client';

// Remove unused imports
// import { UTCTimestamp } from 'lightweight-charts';
// import { ChartData } from './apiService';

// Polygon API key - should be moved to environment variables in production
const POLYGON_API_KEY = 'v0hldwUdqQIRWo1J1_3W1nFSUppESO7N';

/**
 * Logger function for WebSocket events
 * @param type The type of log (info, error, warn)
 * @param message The message to log
 * @param data Optional data to include in the log
 */
const logWS = (type: 'info' | 'error' | 'warn', message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const prefix = `[WebSocket ${timestamp}] ${type.toUpperCase()}:`;
  
  switch (type) {
    case 'error':
      console.error(prefix, message, data || '');
      break;
    case 'warn':
      console.warn(prefix, message, data || '');
      break;
    case 'info':
    default:
      console.log(prefix, message, data || '');
      break;
  }
  
  // In a production app, we might want to also log to a server or service
};

/**
 * WebSocket message types from Polygon
 */
type MessageType = 'T' | 'Q' | 'AM' | 'A';

/**
 * WebSocket message from Polygon
 */
interface PolygonWebSocketMessage {
  ev: MessageType; // Event type
  sym: string;     // Symbol
  v: number;       // Volume
  av: number;      // Accumulated volume (for aggregates)
  op: number;      // Open price
  vw: number;      // Volume weighted average price
  o: number;       // Open
  h: number;       // High
  l: number;       // Low
  c: number;       // Close
  s: number;       // Start timestamp
  e: number;       // End timestamp
  z: number;       // Average trade size
}

/**
 * Polygon WebSocket service for real-time market data
 */
class PolygonWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentSymbol: string | null = null;
  private isConnected = false;
  
  // Callback functions
  public onMessage: ((data: {
    t: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
  }) => void) | null = null;
  
  public onConnect: (() => void) | null = null;
  public onDisconnect: (() => void) | null = null;
  public onError: ((error: Error | Event) => void) | null = null;

  /**
   * Initialize WebSocket connection to Polygon
   */
  init() {
    logWS('info', 'Initializing WebSocket service');
    // Reset state
    this.reconnectAttempts = 0;
    this.currentSymbol = null;
    this.isConnected = false;
  }

  /**
   * Connect to WebSocket for a specific symbol
   * @param symbol Symbol to subscribe to (e.g., 'AAPL', 'BTC-USD')
   */
  connectToSymbol(symbol: string) {
    logWS('info', `Connecting to symbol: ${symbol}`);
    // Close existing connection if any
    this.disconnect();
    
    this.currentSymbol = symbol;
    
    // Connect to Polygon WebSocket
    try {
      this.socket = new WebSocket(`wss://socket.polygon.io/crypto`);
      
      this.socket.onopen = () => {
        logWS('info', 'WebSocket connection opened');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send authentication message
        if (this.socket) {
          const authMessage = JSON.stringify({ action: 'auth', params: POLYGON_API_KEY });
          logWS('info', 'Sending authentication message');
          this.socket.send(authMessage);
          
          // Subscribe to the symbol's aggregated minute data
          // Format symbol for crypto as 'X:BTCUSD' - remove any hyphens
          const formattedSymbol = symbol.includes('-') 
            ? `X:${symbol.replace('-', '')}`
            : symbol;
          
          const subscribeMessage = JSON.stringify({ 
            action: 'subscribe', 
            params: `AM.${formattedSymbol}` 
          });
          logWS('info', `Subscribing to: AM.${formattedSymbol}`);
          this.socket.send(subscribeMessage);
        }
        
        if (this.onConnect) {
          this.onConnect();
        }
      };
      
      this.socket.onmessage = (event) => this.handleMessage(event);
      
      this.socket.onclose = (event) => {
        logWS('info', `WebSocket connection closed, code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
        this.isConnected = false;
        
        if (this.onDisconnect) {
          this.onDisconnect();
        }
        
        // Try to reconnect
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error: Event) => {
        logWS('error', 'WebSocket error:', error);
        
        if (this.onError) {
          this.onError(error);
        }
      };
    } catch (error) {
      logWS('error', 'Error establishing WebSocket connection:', error);
      if (this.onError) {
        this.onError(error as Error);
      }
    }
  }
  
  /**
   * Handle incoming WebSocket messages
   * @param event WebSocket message event
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      // Handle authentication success message
      if (data.ev === 'status' && data.status === 'auth_success') {
        logWS('info', 'Successfully authenticated with Polygon WebSocket');
        return;
      }
      
      // Log other status messages
      if (data.ev === 'status') {
        logWS('info', `Received status message: ${data.status}`, data);
        return;
      }
      
      // Handle minute aggregates
      if (Array.isArray(data)) {
        logWS('info', `Received data array with ${data.length} items`);
        
        data.forEach(msg => {
          // Type check and cast to PolygonWebSocketMessage
          if (this.isPolygonAggregateMessage(msg)) {
            logWS('info', `Processing aggregate message for ${msg.sym || 'unknown symbol'}`, {
              time: new Date(msg.s).toISOString(),
              open: msg.o,
              high: msg.h,
              low: msg.l,
              close: msg.c,
              volume: msg.v
            });
            
            if (this.onMessage) {
              // Pass the raw data to the callback
              this.onMessage({
                t: msg.s, // Start timestamp (milliseconds)
                o: msg.o, // Open
                h: msg.h, // High
                l: msg.l, // Low
                c: msg.c, // Close
                v: msg.v  // Volume
              });
            }
          } else {
            logWS('warn', 'Received message does not match expected format', msg);
          }
        });
      }
    } catch (error) {
      logWS('error', 'Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Type guard to check if a message is a Polygon aggregate message
   * @param msg Any message received from WebSocket
   * @returns True if message is a valid Polygon aggregate message
   */
  private isPolygonAggregateMessage(msg: unknown): msg is PolygonWebSocketMessage {
    if (!msg || typeof msg !== 'object') {
      return false;
    }
    
    // Use a type assertion once to allow property checks
    const record = msg as Record<string, unknown>;
    
    return (
      record.ev === 'AM' && 
      typeof record.o === 'number' && 
      typeof record.h === 'number' && 
      typeof record.l === 'number' && 
      typeof record.c === 'number' && 
      typeof record.s === 'number' && 
      typeof record.v === 'number'
    );
  }
  
  /**
   * Attempt to reconnect after connection loss
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logWS('error', `Maximum reconnect attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    logWS('info', `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.currentSymbol) {
        this.connectToSymbol(this.currentSymbol);
      }
    }, delay);
  }
  
  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      // Unsubscribe from current symbol if connected
      if (this.isConnected && this.currentSymbol) {
        const formattedSymbol = this.currentSymbol.includes('-') 
          ? `X:${this.currentSymbol.replace('-', '')}`
          : this.currentSymbol;
          
        const unsubscribeMessage = JSON.stringify({ 
          action: 'unsubscribe', 
          params: `AM.${formattedSymbol}` 
        });
        
        try {
          logWS('info', `Unsubscribing from: AM.${formattedSymbol}`);
          this.socket.send(unsubscribeMessage);
        } catch (error) {
          logWS('error', 'Error unsubscribing from symbol:', error);
        }
      }
      
      logWS('info', 'Closing WebSocket connection');
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.currentSymbol = null;
    }
  }
  
  /**
   * Check if WebSocket is currently connected
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
const polygonWebSocketService = new PolygonWebSocketService();

export default polygonWebSocketService; 