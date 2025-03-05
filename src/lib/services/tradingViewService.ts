import { prisma, handlePrismaOperation } from '../db/prisma';
import { ChartLayoutConfig, ChartType, TimeFrame } from '@/types';

/**
 * Service for managing TradingView platform features
 */
export const tradingViewService = {
  /**
   * Get user's chart layouts
   */
  async getUserChartLayouts(userId: string): Promise<{ data: any[] | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      return prisma.chartLayout.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { updatedAt: 'desc' },
        ],
      });
    }, `Failed to fetch chart layouts for user ${userId}`);
  },

  /**
   * Create or update a chart layout
   */
  async saveChartLayout(
    userId: string,
    name: string,
    layout: ChartLayoutConfig,
    isDefault = false
  ): Promise<{ layoutId: string | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      // Check if layout with this name already exists
      const existingLayout = await prisma.chartLayout.findUnique({
        where: {
          userId_name: {
            userId,
            name,
          },
        },
      });

      if (existingLayout) {
        // Update existing layout
        const updated = await prisma.chartLayout.update({
          where: { id: existingLayout.id },
          data: {
            config: layout,
            updatedAt: new Date(),
            isDefault,
          },
        });
        return updated.id;
      } else {
        // Create new layout
        const created = await prisma.chartLayout.create({
          data: {
            userId,
            name,
            config: layout,
            isDefault,
            updatedAt: new Date(),
          },
        });
        return created.id;
      }
    }, `Failed to save chart layout ${name}`);
  },

  /**
   * Get a specific chart layout
   */
  async getChartLayout(layoutId: string): Promise<{ data: any | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      return prisma.chartLayout.findUnique({
        where: { id: layoutId },
      });
    }, `Failed to fetch chart layout ${layoutId}`);
  },

  /**
   * Delete a chart layout
   */
  async deleteChartLayout(layoutId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const layout = await prisma.chartLayout.findUnique({
        where: { id: layoutId },
      });

      if (!layout) {
        throw new Error('Chart layout not found');
      }

      if (layout.userId !== userId) {
        throw new Error('Unauthorized: Cannot delete another user\'s layout');
      }

      await prisma.chartLayout.delete({
        where: { id: layoutId },
      });

      return { success: true, error: null };
    } catch (error) {
      console.error(`Error deleting chart layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        success: false, 
        error: `Failed to delete chart layout: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  /**
   * Get user's watchlists
   */
  async getUserWatchlists(userId: string): Promise<{ data: any[] | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      return prisma.watchlist.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              symbol: {
                select: {
                  ticker: true,
                  name: true,
                  type: true,
                  exchange: true,
                },
              },
            },
          },
        },
        orderBy: [
          { isDefault: 'desc' },
          { updatedAt: 'desc' },
        ],
      });
    }, `Failed to fetch watchlists for user ${userId}`);
  },

  /**
   * Create a new watchlist
   */
  async createWatchlist(
    userId: string,
    name: string,
    description?: string,
    isDefault = false
  ): Promise<{ watchlistId: string | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      // If creating a default watchlist, unset other defaults
      if (isDefault) {
        await prisma.watchlist.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Create the watchlist
      const watchlist = await prisma.watchlist.create({
        data: {
          userId,
          name,
          description,
          isDefault,
        },
      });

      return watchlist.id;
    }, `Failed to create watchlist ${name}`);
  },

  /**
   * Add symbol to watchlist
   */
  async addToWatchlist(
    watchlistId: string,
    ticker: string,
    notes?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Find the symbol
      const symbol = await prisma.symbol.findUnique({
        where: { ticker },
      });

      if (!symbol) {
        throw new Error(`Symbol ${ticker} not found`);
      }

      // Check if already in watchlist
      const existing = await prisma.watchlistItem.findUnique({
        where: {
          watchlistId_symbolId: {
            watchlistId,
            symbolId: symbol.id,
          },
        },
      });

      if (existing) {
        // Update notes if provided
        if (notes) {
          await prisma.watchlistItem.update({
            where: { id: existing.id },
            data: { notes },
          });
        }
        return { success: true, error: null };
      }

      // Add to watchlist
      await prisma.watchlistItem.create({
        data: {
          watchlistId,
          symbolId: symbol.id,
          notes,
        },
      });

      return { success: true, error: null };
    } catch (error) {
      console.error(`Error adding to watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        success: false, 
        error: `Failed to add to watchlist: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  /**
   * Remove symbol from watchlist
   */
  async removeFromWatchlist(
    watchlistId: string,
    ticker: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Find the symbol
      const symbol = await prisma.symbol.findUnique({
        where: { ticker },
      });

      if (!symbol) {
        throw new Error(`Symbol ${ticker} not found`);
      }

      // Delete watchlist item
      await prisma.watchlistItem.deleteMany({
        where: {
          watchlistId,
          symbolId: symbol.id,
        },
      });

      return { success: true, error: null };
    } catch (error) {
      console.error(`Error removing from watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        success: false, 
        error: `Failed to remove from watchlist: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(
    watchlistId: string,
    userId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const watchlist = await prisma.watchlist.findUnique({
        where: { id: watchlistId },
      });

      if (!watchlist) {
        throw new Error('Watchlist not found');
      }

      if (watchlist.userId !== userId) {
        throw new Error('Unauthorized: Cannot delete another user\'s watchlist');
      }

      // Delete the watchlist (cascade will delete items)
      await prisma.watchlist.delete({
        where: { id: watchlistId },
      });

      return { success: true, error: null };
    } catch (error) {
      console.error(`Error deleting watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        success: false, 
        error: `Failed to delete watchlist: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },

  /**
   * Create default chart layout for new users
   */
  async createDefaultChartLayout(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Define a default layout
      const defaultLayout: ChartLayoutConfig = {
        id: '',
        name: 'Default Layout',
        chartType: 'candle' as ChartType,
        timeframe: '1h' as TimeFrame,
        indicators: [
          {
            id: 'ma-50',
            type: 'sma',
            name: 'MA 50',
            color: '#2196F3',
            visible: true,
            settings: { period: 50 },
          },
          {
            id: 'ma-200',
            type: 'sma',
            name: 'MA 200',
            color: '#FF5722',
            visible: true,
            settings: { period: 200 },
          }
        ],
        drawingTools: [],
        gridConfig: {
          showGrid: true,
          showAxis: true,
          showLabels: true,
        },
        colorConfig: {
          background: '#131722',
          text: '#D1D4DC',
          grid: '#363C4E',
          upCandle: '#26A69A',
          downCandle: '#EF5350',
        },
      };

      // Create the layout
      await prisma.chartLayout.create({
        data: {
          userId,
          name: 'Default',
          isDefault: true,
          config: defaultLayout,
        },
      });

      // Create default watchlists
      await prisma.watchlist.create({
        data: {
          userId,
          name: 'Favorites',
          isDefault: true,
        },
      });

      await prisma.watchlist.create({
        data: {
          userId,
          name: 'Market Overview',
          isDefault: false,
        },
      });

      return { success: true, error: null };
    } catch (error) {
      console.error(`Error creating default chart layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        success: false, 
        error: `Failed to create default chart layout: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  },
}; 