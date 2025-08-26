import algosdk, { TransactionSigner } from "algosdk";

export interface DepositParams {
  address: string;
  amount: number;
  appId: number;
  depositAssetId: number;
  lstAssetId: number;
  signer: TransactionSigner;
}

export interface WithdrawParams {
  address: string;
  amount: number;
  appId: number;
  lstTokenId: number;
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
  signer: TransactionSigner;
}
export interface getBoxValueReturnType {
  assetId: bigint
  baseAssetId: bigint
  marketBaseAssetId: bigint
  totalCollateral: bigint
  boxRef: algosdk.BoxReference
}

export interface RepayDebtAsaParams {
  address: string;
  amount: number;
  appId: number;
  lstTokenId: number;
  repayTokenId: number;
  signer: TransactionSigner;
}

export interface WithdrawCollateralParams {
  address: string;
  amount: number;
  appId: number;
  collateralAssetId: number;
  lstAppId: number;
  signer: TransactionSigner;
}

export interface RepayDebtAlgoParams {
  address: string;
  amount: number;
  appId: number;
  lstTokenId: number;
  signer: TransactionSigner;
}