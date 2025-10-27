import { OrbitalLendingUserRecord } from '../models/index.js';

interface UserRecordData {
  address: string;
  marketId: number;
  action: string;
  tokensOut: number;
  tokensIn: number;
  timestamp: number;
  txnId: string;
  tokenInId: number;
  tokenOutId: number;
}

interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

interface TokenStats {
  in: number;
  out: number;
}

interface UserStatsData {
  baseToken: TokenStats;
  lstToken: TokenStats;
  collateral: Record<number, TokenStats>;
}

export async function addUserRecord(body: UserRecordData): Promise<ServiceResponse<any>> {
  try {
    const {
      address,
      marketId,
      action,
      tokensOut,
      tokensIn,
      timestamp,
      txnId,
      tokenInId,
      tokenOutId,
    } = body;
    
    const newRecord = await OrbitalLendingUserRecord.create({
      address,
      marketId,
      action,
      tokensOut,
      tokensIn,
      timestamp,
      txnId,
      tokenInId,
      tokenOutId,
    });

    return {
      success: true,
      data: newRecord,
    };
  } catch (error) {
    console.error('Error adding user record:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getUserRecordsByMarketId(marketId: number): Promise<ServiceResponse<any[]>> {
  try {
    const records = await OrbitalLendingUserRecord.findAll({
      where: { marketId },
    });

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error('Error fetching user records:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getUserRecordsByAddressAndMarketId(
  address: string,
  marketId: number
): Promise<ServiceResponse<any[]>> {
  try {
    const records = await OrbitalLendingUserRecord.findAll({
      where: { address, marketId },
    });

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error('Error fetching user records:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getUserStatsForMarket(
  address: string,
  marketId: number,
  baseTokenId: number,
  lstTokenId: number,
  acceptedCollateralTokenIds: number[]
): Promise<ServiceResponse<UserStatsData>> {
  try {
    const records = await getUserRecordsByAddressAndMarketId(address, marketId);
    if (!records.success) throw new Error('Failed to fetch user records');
    
    if (records.data) {
      let baseTokenIn = records.data.reduce((acc, record) => {
        if (record.tokenInId == baseTokenId) {
          return acc + record.tokensIn;
        }
        return acc;
      }, 0);
      
      let baseTokenOut = records.data.reduce((acc, record) => {
        if (record.tokenOutId == baseTokenId) {
          return acc + record.tokensOut;
        }
        return acc;
      }, 0);
      
      let lstTokenIn = records.data.reduce((acc, record) => {
        if (record.tokenInId == lstTokenId) {
          return acc + record.tokensIn;
        }
        return acc;
      }, 0);
      
      let lstTokenOut = records.data.reduce((acc, record) => {
        if (record.tokenOutId == lstTokenId) {
          return acc + record.tokensOut;
        }
        return acc;
      }, 0);
      
      const collateralValues: Record<number, TokenStats> = {};
      for (const col of acceptedCollateralTokenIds) {
        let collateralTokenIn = records.data.reduce((acc, record) => {
          if (record.tokenInId === col) {
            return acc + record.tokensIn;
          }
          return acc;
        }, 0);
        
        let collateralTokenOut = records.data.reduce((acc, record) => {
          if (record.tokenOutId === col) {
            return acc + record.tokensOut;
          }
          return acc;
        }, 0);
        
        collateralValues[col] = {
          in: collateralTokenIn,
          out: collateralTokenOut,
        };
      }

      return {
        success: true,
        data: {
          baseToken: {
            in: baseTokenIn,
            out: baseTokenOut,
          },
          lstToken: {
            in: lstTokenIn,
            out: lstTokenOut,
          },
          collateral: collateralValues,
        },
      };
    }

    return {
      success: false,
      data: null,
      error: 'No records found',
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getUserStats(address: string): Promise<ServiceResponse<any[]>> {
  try {
    const records = await OrbitalLendingUserRecord.findAll({
      where: { address },
    });
    
    if (records) {
      return {
        success: true,
        data: records,
      };
    }

    return {
      success: false,
      data: null,
      error: 'No records found',
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

