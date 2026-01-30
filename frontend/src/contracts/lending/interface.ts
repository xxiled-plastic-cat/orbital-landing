import algosdk, { TransactionSigner } from "algosdk";

export interface DepositParams {
  address: string;
  amount: number;
  appId: number;
  depositAssetId: number;
  lstAssetId: number;
  baseTokenDecimals: number;
  signer: TransactionSigner;
}

export interface WithdrawParams {
  address: string;
  amount: number;
  appId: number;
  lstTokenId: number;
  lstTokenDecimals: number;
  signer: TransactionSigner;
}

export interface UserLendingInfoParams {
  address: string;
  appId: number;
  signer: TransactionSigner;
}

export interface getLoanRecordParams {
  address: string;
  appId: number;
  signer: TransactionSigner;
}

export interface getLoanRecordReturnType {
  borrowerAddress: string
  collateralTokenId: bigint
  collateralAmount: bigint
  lastDebtChange: number[]
  borrowedTokenId: bigint
  principal: bigint
  userIndexWad: bigint
  boxRef: algosdk.BoxReference
}



export interface BorrowParams {
  address: string;
  collateralAmount: number;
  borrowAmount: number;
  collateralAssetId: number;
  lstAppId: number;
  appId: number;
  oracleAppId: number;
  collateralTokenDecimals: number;
  baseTokenDecimals: number;
  signer: TransactionSigner;
}
export interface getBoxValueReturnType {
  assetId: bigint
  baseAssetId: bigint
  marketBaseAssetId: bigint
  totalCollateral: bigint
  originatingAppId: bigint
  boxRef: algosdk.BoxReference
}

export interface RepayDebtAsaParams {
  address: string;
  amount: number;
  appId: number;
  lstTokenId: number;
  repayTokenId: number;
  baseTokenDecimals: number;
  signer: TransactionSigner;
}

export interface WithdrawCollateralParams {
  address: string;
  amount: number;
  appId: number;
  collateralAssetId: number;
  lstAppId: number;
  lstTokenDecimals: number;
  signer: TransactionSigner;
}

export interface BuyoutAsaParams {
  buyerAddress: string;
  debtorAddress: string;
  appId: number;
  premiumAmount: number; // Premium amount in xUSD tokens
  debtRepayAmount: number; // Debt repayment amount in base ASA tokens
  xUSDAssetId: number;
  baseTokenAssetId: number;
  collateralTokenId: number;
  lstAppId: number;
  oracleAppId: number;
  premiumTokenDecimals: number; // xUSD decimals (typically 6)
  baseTokenDecimals: number;
  signer: TransactionSigner;
}

export interface BuyoutAlgoParams {
  buyerAddress: string;
  debtorAddress: string;
  appId: number;
  premiumAmount: number; // Premium amount in xUSD tokens
  debtRepayAmount: number; // Debt repayment amount in microAlgos
  xUSDAssetId: number;
  collateralTokenId: number;
  lstAppId: number;
  oracleAppId: number;
  premiumTokenDecimals: number; // xUSD decimals (typically 6)
  signer: TransactionSigner;
}

export interface RepayDebtAlgoParams {
  address: string;
  amount: number;
  appId: number;
  lstTokenId: number;
  baseTokenDecimals: number;
  signer: TransactionSigner;
}

export interface LiquidateAlgoParams {
  liquidatorAddress: string;
  debtorAddress: string;
  appId: number;
  repayAmount: number; // Amount to repay in microAlgos (up to 50% of debt)
  collateralTokenId: number;
  lstAppId: number;
  oracleAppId: number;
  signer: TransactionSigner;
}

export interface LiquidateAsaParams {
  liquidatorAddress: string;
  debtorAddress: string;
  appId: number;
  repayAmount: number; // Amount to repay in base ASA tokens (up to 50% of debt)
  baseTokenAssetId: number;
  collateralTokenId: number;
  lstAppId: number;
  oracleAppId: number;
  baseTokenDecimals: number;
  signer: TransactionSigner;
}