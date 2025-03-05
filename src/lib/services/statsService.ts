/**
 * Stats Service
 * 
 * Placeholder service for retrieving trading statistics.
 * Currently returns mock data, but designed to be easily connected to a real database in the future.
 */

import { mockStats, Stats, Trade } from '../mockStats';

/**
 * Logger function for stats service
 * @param action The action being performed
 * @param details Details about the action
 */
const logStats = (action: string, details?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[StatsService ${timestamp}]`, action, details || '');
};

/**
 * Get user statistics 
 * 
 * In the future, this will query real stats from the database.
 * Currently returns mock data.
 * 
 * @param userId The ID of the user to get stats for
 * @returns Trading statistics for the user
 */
export async function getUserStats(userId: string): Promise<Stats> {
  logStats('Fetching user stats', { userId });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In the future, this would query a database
  // For now, return mock data
  return mockStats;
}

/**
 * Get recent trades for a user
 * 
 * In the future, this will query recent trades from the database.
 * Currently returns mock data.
 * 
 * @param userId The ID of the user to get trades for
 * @param limit Maximum number of trades to return
 * @returns Recent trades for the user
 */
export async function getUserTrades(userId: string, limit = 10): Promise<Trade[]> {
  logStats('Fetching user trades', { userId, limit });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In the future, this would query a database
  // For now, return mock trades data
  return mockStats.recentTrades.slice(0, limit);
}

/**
 * Get equity curve data for a user
 * 
 * In the future, this will query historical equity data from the database.
 * Currently returns mock data.
 * 
 * @param userId The ID of the user to get equity data for
 * @param period The time period to get data for ('day', 'week', 'month', 'year')
 * @returns Array of equity points over time
 */
export async function getEquityCurve(
  userId: string, 
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<{ date: string; equity: number }[]> {
  logStats('Fetching equity curve', { userId, period });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Generate mock equity curve data
  const points: { date: string; equity: number }[] = [];
  const baseEquity = 10000;
  const now = new Date();
  
  // Number of data points based on period
  const dataPoints = period === 'day' ? 24 : 
                     period === 'week' ? 7 : 
                     period === 'month' ? 30 : 365;
  
  // Time increment based on period
  const timeIncrement = period === 'day' ? 60 * 60 * 1000 : // 1 hour
                        period === 'week' ? 24 * 60 * 60 * 1000 : // 1 day
                        period === 'month' ? 24 * 60 * 60 * 1000 : // 1 day
                        24 * 60 * 60 * 1000; // 1 day for 'year'
  
  // Generate data points
  let currentEquity = baseEquity;
  for (let i = 0; i < dataPoints; i++) {
    // Calculate date for this point
    const pointDate = new Date(now.getTime() - ((dataPoints - i) * timeIncrement));
    
    // Random change between -2% and +2%
    const change = (Math.random() * 4 - 2) / 100;
    currentEquity = currentEquity * (1 + change);
    
    // Add data point
    points.push({
      date: pointDate.toISOString().split('T')[0],
      equity: Math.round(currentEquity * 100) / 100
    });
  }
  
  return points;
} 