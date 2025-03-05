'use client';

/**
 * Minimal Coinbase WebSocket service
 * Connects to wss://ws-feed.exchange.coinbase.com
 * Subscribes to the 'ticker' channel for 'BTC-USD'.
 */

const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';

interface CoinbaseTickerMessage {
  type: string;           // e.g. "ticker"
  product_id: string;     // "BTC-USD"
  price?: string;         // "1290.23"
  last_size?: string;
  best_bid?: string;
  best_ask?: string;
  volume_24h?: string;
  // Additional fields possible
}

/**
 * Logger function
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

  public onMessage: ((data: {
    t: number; // We'll store timestamp
    price: number;
  }) => void) | null = null;
  public onConnect: (() => void) | null = null;
  public onDisconnect: (() => void) | null = null;
  public onError: ((error: Error | Event) => void) | null = null;

  /**
   * Initialize the service
   */
  init() {
    logCoinbase('info', 'Initializing Coinbase WebSocket');
    this.reconnectAttempts = 0;
    this.isConnected = false;
  }

  /**
   * Connect specifically for BTC-USD 'ticker' (since user wants only BTC for now)
   */
  connectForBTC() {
    this.disconnect();

    try {
      this.socket = new WebSocket(COINBASE_WS_URL);

      this.socket.onopen = () => {
        logCoinbase('info', 'Coinbase WebSocket open');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Subscribe to ticker for BTC-USD
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          const subscribeMessage = {
            type: "subscribe",
            product_ids: ["BTC-USD"],
            channels: ["ticker"]
          };
          this.socket.send(JSON.stringify(subscribeMessage));
          logCoinbase('info', 'Subscribed to BTC-USD ticker on Coinbase');

          if (this.onConnect) {
            this.onConnect();
          }
        }
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.socket.onclose = (event) => {
        logCoinbase('info', `Coinbase socket closed, code=${event.code}, reason=${event.reason}`);
        this.isConnected = false;
        if (this.onDisconnect) {
          this.onDisconnect();
        }
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        logCoinbase('error', 'Coinbase socket error', error);
        if (this.onError) {
          this.onError(new Error(`Coinbase WebSocket error: ${JSON.stringify(error)}`));
        }
        this.attemptReconnect();
      };

    } catch (err) {
      logCoinbase('error', 'Error connecting coinbase ws', err);
      if (this.onError) {
        const e = err instanceof Error
          ? err
          : new Error('Unknown coinbase ws error');
        this.onError(e);
      }
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data: CoinbaseTickerMessage = JSON.parse(event.data);

      if (data.type === 'ticker' && data.product_id === 'BTC-USD' && data.price) {
        // For demonstration, let's parse the price
        const priceVal = parseFloat(data.price);
        const timestamp = Date.now(); // we don't get ms in the coinbase ticker event

        if (this.onMessage) {
          this.onMessage({
            t: timestamp,
            price: priceVal
          });
        }
      }
    } catch (error) {
      logCoinbase('error', 'Error parsing coinbase ws message', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logCoinbase('warn', `Coinbase max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    logCoinbase('info', `Reconnecting in ${delay} ms, attempt #${this.reconnectAttempts}`);
    setTimeout(() => {
      this.connectForBTC();
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      logCoinbase('info', 'Disconnecting Coinbase socket');
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

const coinbaseWebSocketService = new CoinbaseWebSocketService();
export default coinbaseWebSocketService;
