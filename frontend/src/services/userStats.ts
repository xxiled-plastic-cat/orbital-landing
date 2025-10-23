import { addUserRecord } from "./orbitalApi";



export interface UserAction {
    address: string,
    marketId: number,
    action: string,
    tokensOut: number,
    tokensIn: number,
    timestamp: number,
    txnId: string,
    tokenInId: number,
    tokenOutId: number,
}

export async function recordUserAction(action: UserAction) {
  try {
    const result = await addUserRecord({
      address: action.address,
      marketId: action.marketId,
      action: action.action,
      tokensOut: action.tokensOut,
      tokensIn: action.tokensIn,
      timestamp: action.timestamp,
      txnId: action.txnId,
      tokenInId: action.tokenInId,
      tokenOutId: action.tokenOutId,
    });
    
    console.log('User action recorded successfully');
    return result;
  } catch (error) {
    console.error('Failed to record user action:', error);
    // Don't throw - allow the transaction to succeed even if recording fails
    return { success: false, error };
  }
}