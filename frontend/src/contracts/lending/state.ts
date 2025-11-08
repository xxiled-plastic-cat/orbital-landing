/* eslint-disable @typescript-eslint/no-explicit-any */
import algosdk, { TransactionSigner } from "algosdk";
import { getExistingClient } from "./getClient";
import { getBoxValueReturnType } from "./interface";
import { OrbitalLendingClient } from "./orbital-lendingClient";

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

export async function getAcceptedCollateral(
  address: string,
  appId: number,
  signer: TransactionSigner
) {
  const appClient = await getExistingClient(signer, address, appId);

  console.log("appClient", appClient);
  const collateralBox = await appClient.state.box.acceptedCollaterals.getMap();
  console.log("collateralBox", collateralBox);
  return collateralBox;
}

/**
 * Calculate the amount of LST tokens due when making a deposit
 * @param amountIn - The deposit amount in microunits
 * @param circulatingLST - Total circulating LST tokens in microunits
 * @param totalDeposits - Total deposits in the pool in microunits
 * @returns Amount of LST tokens to mint for the depositor in microunits
 */
export function calculateLSTDue(
  amountIn: bigint,
  circulatingLST: bigint,
  totalDeposits: bigint
): bigint {
  // If no deposits exist yet, return the deposit amount as initial LST supply (1:1 ratio)
  if (totalDeposits === 0n) {
    return amountIn;
  }

  // Calculate LST due using the formula: (amountIn * circulatingLST) / totalDeposits
  // This maintains the proportional share of the pool
  const lstDue = (amountIn * circulatingLST) / totalDeposits;

  return lstDue;
}

/**
 * Calculate the amount of underlying asset to return when redeeming LST tokens
 * @param lstAmount - The amount of LST tokens being redeemed in microunits
 * @param circulatingLST - Total circulating LST tokens in microunits
 * @param totalDeposits - Total deposits in the pool in microunits
 * @returns Amount of underlying asset to return to the redeemer in microunits
 */
export function calculateAssetDue(
  lstAmount: bigint,
  circulatingLST: bigint,
  totalDeposits: bigint
): bigint {
  // If no LST tokens exist, return 0
  if (circulatingLST === 0n) {
    return 0n;
  }

  // Calculate asset due using the formula: (lstAmount * totalDeposits) / circulatingLST
  // This maintains the proportional share of the pool
  const assetDue = (lstAmount * totalDeposits) / circulatingLST;

  return assetDue;
}

export async function getDepositBoxValue(
  userAddress: string,
  appClient: any, // Accepts both OrbitalLendingClient and OrbitalLendingAsaClient
  assetInQuestion: bigint
) {
  const depositKeyType = new algosdk.ABITupleType([
    new algosdk.ABIAddressType(),
    new algosdk.ABIUintType(64), // assetId
  ]);
  const depositRecordType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64), // assetId
    new algosdk.ABIUintType(64), // depositAmount
  ]);
  const prefix = new TextEncoder().encode("deposit_record"); // Replace with your actual prefix

  const encodedKey = depositKeyType.encode([
    algosdk.decodeAddress(userAddress).publicKey,
    assetInQuestion,
  ]);
  const boxName = new Uint8Array([...prefix, ...encodedKey]);
  const boxValue = await appClient.appClient.getBoxValueFromABIType(
    boxName,
    depositRecordType
  );
  const [depositAmount, assetId] = boxValue as bigint[];
  return {
    assetId: assetId,
    depositAmount: depositAmount,
  };
}

export async function getCollateralBoxValue(
  index: bigint,
  appClient: OrbitalLendingClient,
  appId: bigint
): Promise<getBoxValueReturnType> {
  const acceptedCollateralType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64), // assetId
    new algosdk.ABIUintType(64), // baseAssetId
    new algosdk.ABIUintType(64), // marketBaseAssetId
    new algosdk.ABIUintType(64), // totalCollateral
    new algosdk.ABIUintType(64), // originatingAppId
  ]);

  const boxNames = await appClient.state.box.acceptedCollaterals.getMap();
  console.log("boxNames", boxNames);

  const keyBytes = new Uint8Array(8);
  const view = new DataView(keyBytes.buffer);
  view.setBigUint64(0, index, false); // false for big-endian
  const prefix = new TextEncoder().encode("accepted_collaterals");
  const boxName = new Uint8Array(prefix.length + keyBytes.length);
  boxName.set(prefix, 0);
  boxName.set(keyBytes, prefix.length);
  const collateral = await appClient.appClient.getBoxValueFromABIType(
    boxName,
    acceptedCollateralType
  );
  const [
    assetId,
    baseAssetId,
    marketBaseAssetId,
    totalCollateral,
    originatingAppId,
  ] = collateral as bigint[];
  return {
    assetId,
    baseAssetId,
    marketBaseAssetId,
    totalCollateral,
    originatingAppId,
    boxRef: {
      appIndex: appId,
      name: new TextEncoder().encode("accepted_collaterals" + index),
    },
  };
}
