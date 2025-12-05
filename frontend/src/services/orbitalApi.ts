/**
 * Orbital Backend API Client
 * Matches the legacy general backend API structure
 */

import axios from 'axios';
import { ORBITAL_BACKEND_URL } from '../constants/constants';

// Create axios instance with default config
const orbitalApi = axios.create({
  baseURL: ORBITAL_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
orbitalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Orbital API Error:', error);
    return Promise.reject(error);
  }
);

// ==================== Market Endpoints ====================

export interface OrbitalMarket {
  appId: number;
  baseTokenId: number;
  lstTokenId: number;
  network: 'mainnet' | 'testnet';
}

export async function getOrbitalLendingMarkets(): Promise<OrbitalMarket[]> {
  const response = await orbitalApi.get('/orbital/markets');
  return response.data;
}

export async function getOrbitalLendingMarketById(id: number): Promise<OrbitalMarket> {
  const response = await orbitalApi.get(`/orbital/markets/${id}`);
  return response.data;
}

export async function addOrbitalLendingMarket(
  appId: number,
  baseTokenId: number,
  lstTokenId: number,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<OrbitalMarket> {
  const response = await orbitalApi.post('/orbital/markets', {
    appId,
    baseTokenId,
    lstTokenId,
    network,
  });
  return response.data;
}

// ==================== User Record Endpoints ====================

export interface UserRecord {
  address: string;
  marketId: number;
  action: string;
  tokenInId: number;
  tokenOutId: number;
  tokensOut: number;
  tokensIn: number;
  timestamp: number;
  txnId: string;
}

export interface UserStatsForMarket {
  baseToken: {
    in: number;
    out: number;
  };
  lstToken: {
    in: number;
    out: number;
  };
  collateral: Record<number, { in: number; out: number }>;
}

export async function addUserRecord(record: UserRecord) {
  const response = await orbitalApi.post('/orbital/records', record);
  return response.data;
}

export async function getUserRecordsByMarketId(marketId: number) {
  const response = await orbitalApi.get(`/orbital/records/market/${marketId}`);
  return response.data;
}

export async function getUserRecordsByAddressAndMarketId(
  address: string,
  marketId: number
) {
  const response = await orbitalApi.get(`/orbital/records/${address}/${marketId}`);
  return response.data;
}

export async function getUserStatsForMarket(
  address: string,
  marketId: number,
  baseTokenId: number,
  lstTokenId: number,
  acceptedCollateralTokenIds: number[]
) {
  const response = await orbitalApi.post(
    `/orbital/records/${address}/${marketId}/stats`,
    {
      baseTokenId,
      lstTokenId,
      acceptedCollateralTokenIds,
    }
  );
  return response.data;
}

export async function getUserStats(address: string) {
  const response = await orbitalApi.get(`/orbital/records/${address}`);
  return response.data;
}

// ==================== Market Analytics Endpoints ====================

export interface MarketAnalytics {
  id: number;
  marketAppId: number;
  baseTokenId: number;
  tvl: number;
  borrowing: number;
  feePool: string | null; // BigInt as string
  totalCommissionEarned: string | null; // BigInt as string
  dateAdded: string;
}

export interface MarketAnalyticsResponse {
  success: boolean;
  data: MarketAnalytics[];
  count: number;
}

export async function getMarketAnalytics(marketAppId: number, startDate?: string, endDate?: string): Promise<MarketAnalyticsResponse> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await orbitalApi.get(`/orbital/markets/${marketAppId}/analytics`, { params });
  return response.data;
}

export async function getAllMarketAnalytics(): Promise<MarketAnalyticsResponse> {
  const response = await orbitalApi.get('/orbital/markets/analytics');
  return response.data;
}

// ==================== Health Check ====================

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await orbitalApi.get('/health');
    return response.data.success;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

export default orbitalApi;
