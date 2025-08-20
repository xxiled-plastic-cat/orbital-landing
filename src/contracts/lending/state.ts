import { TransactionSigner } from "algosdk";
import { getExistingClient } from "./getClient";

export async function getContractState(
  address: string,
  appId: number,
  signer: TransactionSigner
) {
  const appClient = await getExistingClient(signer, address, appId);
  appClient.algorand.setDefaultSigner(signer);
  const globalState = await appClient.state.global.getAll();

  return globalState;
}



/**
 * Calculate the amount of LST tokens due when making a deposit
 * @param amountIn - The deposit amount in microunits
 * @param circulatingLST - Total circulating LST tokens
 * @param totalDeposits - Total deposits in the pool
 * @returns Amount of LST tokens to mint for the depositor
 */
export function calculateLSTDue(amountIn: bigint, circulatingLST: bigint, totalDeposits: bigint): bigint {
  // If no deposits exist yet, return the deposit amount as initial LST supply (1:1 ratio)
  if (totalDeposits === 0n) {
    return amountIn;
  }

  // Calculate LST due using the formula: (amountIn * circulatingLST) / totalDeposits
  // This maintains the proportional share of the pool
  const lstDue = (amountIn * circulatingLST) / totalDeposits;
  
  return lstDue / 10n ** 6n;
}

/**
 * Calculate the amount of underlying asset to return when redeeming LST tokens
 * @param lstAmount - The amount of LST tokens being redeemed
 * @param circulatingLST - Total circulating LST tokens  
 * @param totalDeposits - Total deposits in the pool
 * @returns Amount of underlying asset to return to the redeemer
 */
export function calculateAssetDue(lstAmount: bigint, circulatingLST: bigint, totalDeposits: bigint): bigint {
  // If no LST tokens exist, return 0
  if (circulatingLST === 0n) {
    return 0n;
  }

  // Calculate asset due using the formula: (lstAmount * totalDeposits) / circulatingLST
  // This maintains the proportional share of the pool
  const assetDue = (lstAmount * totalDeposits) / circulatingLST;
  
  return assetDue / 10n ** 6n ;
}

