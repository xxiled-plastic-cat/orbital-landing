import { TransactionSigner } from "algosdk";

export interface DepositParams {
  address: string;
  amount: number;
  appId: number;
  depositAssetId: number;
  signer: TransactionSigner;
}
