import { prisma, handlePrismaOperation } from '../db/prisma';
import { ChartData, TimeFrame } from '@/types';

/**
 * Service for handling price data operations
 */
export const priceDataService = {
  /**
   * Fetch historical price data for a symbol with the given timeframe
   */
  async getHistoricalData(
    ticker: string,
    timeframe: TimeFrame,
    limit: number = 1000
  ): Promise<{ data: ChartData[] | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      // First, find the symbol by ticker
      const symbol = await prisma.symbol.findUnique({
        where: { ticker },
      });

      if (!symbol) {
        throw new Error(`Symbol ${ticker} not found`);
      }

      // Then fetch the price data for this symbol
      const priceData = await prisma.priceData.findMany({
        where: {
          symbolId: symbol.id,
          timeframe,
        },
        orderBy: {
          timestamp: 'asc',
        },
        take: limit,
      });

      // Map to ChartData format
      return priceData.map((data) => ({
        time: Math.floor(data.timestamp.getTime() / 1000), // Convert to Unix timestamp
        open: parseFloat(data.open.toString()),
        high: parseFloat(data.high.toString()),
        low: parseFloat(data.low.toString()),
        close: parseFloat(data.close.toString()),
        volume: data.volume ? parseFloat(data.volume.toString()) : undefined,
      }));
    }, `Failed to fetch historical data for ${ticker}`);
  },

  /**
   * Insert new price data for a symbol
   */
  async insertPriceData(
    ticker: string,
    timeframe: TimeFrame,
    data: Omit<ChartData, 'time'> & { timestamp: Date }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Find or create the symbol
      const symbol = await prisma.symbol.findUnique({
        where: { ticker },
      });

      if (!symbol) {
        throw new Error(`Symbol ${ticker} not found`);
      }

      // Insert price data
      await prisma.priceData.create({
        data: {
          symbolId: symbol.id,
          timeframe,
          timestamp: data.timestamp,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
        },
      });

      return { success: true, error: null };
    } catch (error) {
      console.error(`Error inserting price data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error: 'Failed to insert price data' };
    }
  },

  /**
   * Get latest price for a symbol
   */
  async getLatestPrice(ticker: string): Promise<{ price: number | null; error: string | null }> {
    try {
      // Find the symbol
      const symbol = await prisma.symbol.findUnique({
        where: { ticker },
      });

      if (!symbol) {
        throw new Error(`Symbol ${ticker} not found`);
      }

      // Get the latest price data (from any timeframe)
      const latestPrice = await prisma.priceData.findFirst({
        where: {
          symbolId: symbol.id,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (!latestPrice) {
        return { price: null, error: `No price data found for ${ticker}` };
      }

      return { price: parseFloat(latestPrice.close.toString()), error: null };
    } catch (error) {
      console.error(`Error getting latest price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { price: null, error: 'Failed to get latest price' };
    }
  },

  /**
   * Search for symbols matching a query
   */
  async searchSymbols(query: string, limit: number = 10): Promise<{ data: any[] | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      return prisma.symbol.findMany({
        where: {
          OR: [
            { ticker: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          ticker: true,
          name: true,
          type: true,
          exchange: true,
        },
        take: limit,
      });
    }, 'Failed to search symbols');
  },
}; 