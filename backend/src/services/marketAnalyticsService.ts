import { Op } from 'sequelize';
import { MarketAnalytics } from '../models/index.js';

export interface MarketAnalyticsData {
  id?: number;
  marketAppId: number;
  baseTokenId: number;
  tvl: number;
  borrowing: number;
  feePool?: bigint | null;
  totalCommissionEarned?: bigint | null;
  dateAdded?: Date;
}

/**
 * Serialize MarketAnalytics instance to JSON-safe format
 * Converts BigInt values to strings
 */
function serializeMarketAnalytics(analytics: MarketAnalytics): any {
  return {
    id: analytics.id,
    marketAppId: analytics.marketAppId,
    baseTokenId: analytics.baseTokenId,
    tvl: analytics.tvl,
    borrowing: analytics.borrowing,
    feePool: analytics.feePool !== null ? analytics.feePool.toString() : null,
    totalCommissionEarned: analytics.totalCommissionEarned !== null ? analytics.totalCommissionEarned.toString() : null,
    dateAdded: analytics.dateAdded.toISOString()
  };
}

/**
 * Get all market analytics records
 */
export async function getAllMarketAnalytics(): Promise<any[]> {
  try {
    const analytics = await MarketAnalytics.findAll({
      order: [['dateAdded', 'DESC']]
    });
    return analytics.map(serializeMarketAnalytics);
  } catch (error) {
    console.error('Error fetching all market analytics:', error);
    throw error;
  }
}

/**
 * Get market analytics for a specific market by app ID
 * Optionally filter by date range
 */
export async function getMarketAnalytics(
  marketAppId: number,
  startDate?: Date,
  endDate?: Date
): Promise<any[]> {
  try {
    const whereClause: any = {
      marketAppId
    };

    if (startDate || endDate) {
      whereClause.dateAdded = {};
      if (startDate) {
        whereClause.dateAdded[Op.gte] = startDate;
      }
      if (endDate) {
        whereClause.dateAdded[Op.lte] = endDate;
      }
    }

    const analytics = await MarketAnalytics.findAll({
      where: whereClause,
      order: [['dateAdded', 'ASC']]
    });
    return analytics.map(serializeMarketAnalytics);
  } catch (error) {
    console.error(`Error fetching market analytics for app ${marketAppId}:`, error);
    throw error;
  }
}

/**
 * Add a new market analytics record
 */
export async function addMarketAnalytics(
  data: MarketAnalyticsData
): Promise<any> {
  try {
    const analytics = await MarketAnalytics.create({
      marketAppId: data.marketAppId,
      baseTokenId: data.baseTokenId,
      tvl: data.tvl,
      borrowing: data.borrowing,
      feePool: data.feePool !== undefined ? data.feePool : null,
      totalCommissionEarned: data.totalCommissionEarned !== undefined ? data.totalCommissionEarned : null,
      dateAdded: data.dateAdded || new Date()
    });
    return serializeMarketAnalytics(analytics);
  } catch (error) {
    console.error('Error adding market analytics:', error);
    throw error;
  }
}

/**
 * Delete market analytics records
 * If marketAppId is provided, delete only records for that market
 * Otherwise, delete all records
 */
export async function deleteMarketAnalytics(marketAppId?: number): Promise<number> {
  try {
    const whereClause = marketAppId ? { marketAppId } : {};
    const deletedCount = await MarketAnalytics.destroy({
      where: whereClause
    });
    return deletedCount;
  } catch (error) {
    console.error('Error deleting market analytics:', error);
    throw error;
  }
}

/**
 * Delete market analytics records older than specified days
 * Default is 30 days
 */
export async function cleanupOldMarketAnalytics(daysOld: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await MarketAnalytics.destroy({
      where: {
        dateAdded: {
          [Op.lt]: cutoffDate
        }
      }
    });

    console.log(`Cleaned up ${deletedCount} market analytics records older than ${daysOld} days`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old market analytics:', error);
    throw error;
  }
}

