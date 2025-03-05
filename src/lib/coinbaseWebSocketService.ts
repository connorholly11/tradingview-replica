'use client';

/**
 * Coinbase WebSocket service
 * Connects to wss://ws-feed.exchange.coinbase.com
 * Handles real-time market data from Coinbase
 */

const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';

interface CoinbaseTickerMessage {
  type: string;           // Message type (e.g., "ticker", "heartbeat", "subscriptions")
  product_id: string;     // Product ID (e.g., "BTC-USD")
  price?: string;         // Current price
  open_24h?: string;      // 24h open price
  volume_24h?: string;    // 24h volume
  low_24h?: string;       // 24h low
  high_24h?: string;      // 24h high
  volume_30d?: string;    // 30d volume
  best_bid?: string;      // Best bid
  best_ask?: string;      // Best ask
  side?: string;          // Side of last match
  time?: string;          // Time of message
  trade_id?: number;      // Trade ID
  last_size?: string;     // Last trade size
}

/**
 * Logger function for Coinbase WebSocket
 */
function logCoinbase(type: 'info' | 'error' | 'warn', msg: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console[type](`[CoinbaseWS ${timestamp}] ${msg}`, data || '');
}

class CoinbaseWebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribedSymbols: Set<string> = new Set();

  // Callback functions
  public onMessage: ((data: {
    t: number;       // Timestamp
    symbol: string;  // Symbol (e.g., "BTC-USD")
    price: number;   // Price
    bid?: number;    // Best bid (optional)
    ask?: number;    // Best ask (optional)
    volume?: number; // Volume (optional)
  }) => void) | null = null;
  
  public onConnect: (() => void) | null = null;
  public onDisconnect: (() => void) | null = null;
  public onError: ((error: Error | Event) => void) | null = null;

  /**
   * Initialize the WebSocket service
   */
  init() {
    logCoinbase('info', 'Initializing Coinbase WebSocket');
    this.reconnectAttempts = 0;
    this.isConnected = false;
    this.subscribedSymbols.clear();
  }

  /**
   * Connect to WebSocket and subscribe to the provided symbol
   * @param symbol Symbol to subscribe to (e.g., "BTC-USD")
   */
  connectToSymbol(symbol: string) {
    logCoinbase('info', `Connecting to symbol: ${symbol}`);
    this.subscribedSymbols.add(symbol);
    
    // If already connected, just subscribe to the new symbol
    if (this.socket && this.isConnected) {
      this.subscribeToSymbols([symbol]);
      return;
    }
    
    // Otherwise, establish a new connection
    this.connect();
  }
  
  /**
   * Connect to the Coinbase WebSocket
   */
  private connect() {
    // Close existing connection if any
    this.disconnect();
    
    try {
      this.socket = new WebSocket(COINBASE_WS_URL);
      
      // Set connection timeout (10 seconds)
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          logCoinbase('error', 'WebSocket connection timed out after 10 seconds');
          this.socket.close();
          
          if (this.onError) {
            this.onError(new Error('WebSocket connection timed out'));
          }
        }
      }, 10000);
      
      this.socket.onopen = () => {
        clearTimeout(connectionTimeout);
        logCoinbase('info', 'Coinbase WebSocket connection opened');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to all symbols that were requested
        if (this.subscribedSymbols.size > 0) {
          const symbols = Array.from(this.subscribedSymbols);
          this.subscribeToSymbols(symbols);
        }
        
        if (this.onConnect) {
          this.onConnect();
        }
      };
      
      this.socket.onmessage = (event) => this.handleMessage(event);
      
      this.socket.onclose = (event) => {
        logCoinbase('info', `Coinbase WebSocket connection closed, code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
        this.isConnected = false;
        
        if (this.onDisconnect) {
          this.onDisconnect();
        }
        
        // Try to reconnect
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error) => {
        const errorInfo = {
          type: 'Coinbase WebSocket Error',
          timestamp: new Date().toISOString(),
          readyState: this.socket?.readyState,
          connectionAttempt: this.reconnectAttempts,
          url: COINBASE_WS_URL
        };
        
        logCoinbase('error', 'Coinbase WebSocket error:', errorInfo);
        
        if (this.onError) {
          this.onError(new Error(`Coinbase WebSocket error: ${JSON.stringify(errorInfo)}`));
        }
      };
    } catch (error) {
      logCoinbase('error', 'Error establishing Coinbase WebSocket connection:', error);
      
      if (this.onError) {
        const wsError = error instanceof Error
          ? error
          : new Error('Failed to establish Coinbase WebSocket connection');
        this.onError(wsError);
      }
      
      // Try to reconnect
      this.attemptReconnect();
    }
  }
  
  /**
   * Subscribe to the specified symbols
   * @param symbols Array of symbols to subscribe to
   */
  private subscribeToSymbols(symbols: string[]) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      logCoinbase('warn', 'Cannot subscribe to symbols: WebSocket not open');
      return;
    }
    
    const subscribeMessage = {
      type: 'subscribe',
      product_ids: symbols,
      channels: ['ticker', 'heartbeat']
    };
    
    try {
      logCoinbase('info', `Subscribing to: ${symbols.join(', ')}`, subscribeMessage);
      this.socket.send(JSON.stringify(subscribeMessage));
    } catch (error) {
      logCoinbase('error', 'Error subscribing to symbols:', error);
      
      if (this.onError) {
        const wsError = error instanceof Error
          ? error
          : new Error(`Failed to subscribe to symbols: ${symbols.join(', ')}`);
        this.onError(wsError);
      }
    }
  }
  
  /**
   * Handle incoming WebSocket messages
   * @param event WebSocket message event
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data: CoinbaseTickerMessage = JSON.parse(event.data);
      
      // Handle different message types
      switch (data.type) {
        case 'ticker':
          if (data.product_id && data.price) {
            const timestamp = data.time ? new Date(data.time).getTime() : Date.now();
            const price = parseFloat(data.price);
            const bid = data.best_bid ? parseFloat(data.best_bid) : undefined;
            const ask = data.best_ask ? parseFloat(data.best_ask) : undefined;
            const volume = data.volume_24h ? parseFloat(data.volume_24h) : undefined;
            
            if (this.onMessage) {
              this.onMessage({
                t: timestamp,
                symbol: data.product_id,
                price,
                bid,
                ask,
                volume
              });
            }
          }
          break;
          
        case 'subscriptions':
          logCoinbase('info', 'Received subscriptions confirmation', data);
          break;
          
        case 'heartbeat':
          // Heartbeat messages are used to keep the connection alive
          // Can be used to detect connection issues
          break;
          
        default:
          // Log other message types for debugging
          logCoinbase('info', `Received message of type: ${data.type}`, data);
          break;
      }
    } catch (error) {
      logCoinbase('error', 'Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Attempt to reconnect to the WebSocket
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logCoinbase('warn', `Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up for now.`);
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    logCoinbase('info', `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * Disconnect from the WebSocket
   */
  disconnect() {
    if (this.socket) {
      if (this.isConnected && this.subscribedSymbols.size > 0) {
        try {
          // Unsubscribe from all subscribed symbols
          const unsubscribeMessage = {
            type: 'unsubscribe',
            product_ids: Array.from(this.subscribedSymbols),
            channels: ['ticker', 'heartbeat']
          };
          
          logCoinbase('info', 'Unsubscribing from all symbols', unsubscribeMessage);
          this.socket.send(JSON.stringify(unsubscribeMessage));
        } catch (error) {
          logCoinbase('error', 'Error unsubscribing from symbols:', error);
        }
      }
      
      logCoinbase('info', 'Closing Coinbase WebSocket connection');
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.subscribedSymbols.clear();
    }
  }
  
  /**
   * Check if the WebSocket is connected
   * @returns True if connected, false otherwise
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Connect to BTC-USD (Legacy method for backward compatibility)
   */
  connectForBTC() {
    this.connectToSymbol('BTC-USD');
  }
}

// Export a singleton instance
const coinbaseWebSocketService = new CoinbaseWebSocketService();
export default coinbaseWebSocketService;
