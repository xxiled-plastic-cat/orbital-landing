import { TransactionSigner } from "algosdk";

export interface OraclePricingParams {
  tokenId: number;
  address: string;
  signer: TransactionSigner;
  appId: number;
}
