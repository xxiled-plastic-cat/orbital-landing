/**
 * Orbital Finance SDK
 * TypeScript SDK for interacting with the Orbital Finance lending protocol on Algorand
 */

// Main client
export { OrbitalSDK } from './client';

// Types
export type {
  OrbitalSDKConfig,
  MarketData,
  APYData,
  LSTPrice,
  UserPosition,
  GlobalState,
  DepositRecord,
  LoanRecord,
  CollateralInfo,
  OraclePrice,
  OraclePriceMap,
  MarketInfo,
  AssetInfo,
  DebtPosition,
} from './types';

// Utility functions
export {
  utilNormBps,
  aprBpsKinked,
  currentAprBps,
  calculateLSTDue,
  calculateAssetDue,
  calculateLSTPrice,
  microToStandard,
  standardToMicro,
} from './utils/calculations';

export {
  getApplicationGlobalState,
  getBoxValue,
  decodeDepositRecord,
  decodeLoanRecord,
  createDepositBoxName,
  createLoanBoxName,
  decodeOraclePrice,
  createOraclePriceBoxName,
} from './utils/state';

export { fetchMarketList, fetchMarketInfo } from './utils/api';

