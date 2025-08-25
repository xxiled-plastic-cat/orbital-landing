import axios from "axios";
import { GENERAL_BACKEND_URL } from "../constants";



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
    const response = await axios.post(`${GENERAL_BACKEND_URL}/orbital/records`, action);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}