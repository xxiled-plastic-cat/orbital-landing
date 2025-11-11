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
} from './utils/state';

