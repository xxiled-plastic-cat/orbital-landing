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
  totalDebt: bigint
  borrowedTokenId: bigint
  lastAccrualTimestamp: bigint
  boxRef: algosdk.BoxReference
}

export interface BorrowParams {
  address: string;
  collateralAmount: number;
  borrowAmount: number;
  collateralAssetId: number;
  lstAppId: number;
  appId: number;
  signer: TransactionSigner;
}
export interface getBoxValueReturnType {
  assetId: bigint
  baseAssetId: bigint
  totalCollateral: bigint
  boxRef: algosdk.BoxReference
}