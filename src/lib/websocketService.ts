// src/lib/websocketService.ts

/**
 * This file now serves as a re-export for our Coinbase WebSocket implementation.
 * All WebSocket functionality is handled by coinbaseWebSocketService.ts
 */

import coinbaseWebSocketService from './coinbaseWebSocketService';

// Export coinbaseWebSocketService as the default
export default coinbaseWebSocketService;
