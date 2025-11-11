import algosdk from 'algosdk';
import { GlobalState } from '../types';

/**
 * Fetch and parse global state from an Algorand application
 * @param algodClient Algod client instance
 * @param appId Application ID
 * @returns Parsed global state
 */
export async function getApplicationGlobalState(
  algodClient: algosdk.Algodv2,
  appId: number
): Promise<GlobalState> {
  const app = await algodClient.getApplicationByID(appId).do();
  const globalState = app.params['global-state'] || [];

  const state: GlobalState = {} as GlobalState;

  for (const item of globalState) {
    const key = Buffer.from(item.key, 'base64').toString('utf8');
    const value = item.value;

    if (value.type === 1) {
      // bytes
      state[key] = Buffer.from(value.bytes, 'base64');
      // Try to decode as address if it's 32 bytes
      if (value.bytes && Buffer.from(value.bytes, 'base64').length === 32) {
        try {
          state[key] = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'));
        } catch {
          state[key] = Buffer.from(value.bytes, 'base64');
        }
      }
    } else if (value.type === 2) {
      // uint
      state[key] = BigInt(value.uint);
    }
  }

  return state;
}

/**
 * Fetch box value from an Algorand application
 * @param algodClient Algod client instance
 * @param appId Application ID
 * @param boxName Box name as Uint8Array
 * @returns Box value as Uint8Array
 */
export async function getBoxValue(
  algodClient: algosdk.Algodv2,
  appId: number,
  boxName: Uint8Array
): Promise<Uint8Array> {
  const boxResponse = await algodClient.getApplicationBoxByName(appId, boxName).do();
  return new Uint8Array(boxResponse.value);
}

/**
 * Decode deposit record box
 * @param boxValue Raw box value
 * @returns Decoded deposit record
 */
export function decodeDepositRecord(boxValue: Uint8Array): {
  assetId: bigint;
  depositAmount: bigint;
} {
  const depositRecordType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64), // assetId
    new algosdk.ABIUintType(64), // depositAmount
  ]);

  const decoded = depositRecordType.decode(boxValue) as bigint[];
  return {
    assetId: decoded[0],
    depositAmount: decoded[1],
  };
}

/**
 * Decode loan record box
 * @param boxValue Raw box value
 * @returns Decoded loan record
 */
export function decodeLoanRecord(boxValue: Uint8Array): {
  collateralTokenId: bigint;
  collateralAmount: bigint;
  lastDebtChange: bigint;
  borrowedTokenId: bigint;
  principal: bigint;
  userIndexWad: bigint;
} {
  const loanRecordType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64), // collateralTokenId
    new algosdk.ABIUintType(64), // collateralAmount
    new algosdk.ABIUintType(64), // lastDebtChange
    new algosdk.ABIUintType(64), // borrowedTokenId
    new algosdk.ABIUintType(64), // principal
    new algosdk.ABIUintType(128), // userIndexWad
  ]);

  const decoded = loanRecordType.decode(boxValue) as bigint[];
  return {
    collateralTokenId: decoded[0],
    collateralAmount: decoded[1],
    lastDebtChange: decoded[2],
    borrowedTokenId: decoded[3],
    principal: decoded[4],
    userIndexWad: decoded[5],
  };
}

/**
 * Create deposit record box name
 * @param userAddress User's Algorand address
 * @param assetId Asset ID
 * @returns Box name as Uint8Array
 */
export function createDepositBoxName(userAddress: string, assetId: bigint): Uint8Array {
  const depositKeyType = new algosdk.ABITupleType([
    new algosdk.ABIAddressType(),
    new algosdk.ABIUintType(64), // assetId
  ]);
  const prefix = new TextEncoder().encode('deposit_record');
  const encodedKey = depositKeyType.encode([
    algosdk.decodeAddress(userAddress).publicKey,
    assetId,
  ]);
  return new Uint8Array([...prefix, ...encodedKey]);
}

/**
 * Create loan record box name
 * @param userAddress User's Algorand address
 * @returns Box name as Uint8Array
 */
export function createLoanBoxName(userAddress: string): Uint8Array {
  const prefix = new TextEncoder().encode('loan_record');
  const addressBytes = algosdk.decodeAddress(userAddress).publicKey;
  return new Uint8Array([...prefix, ...addressBytes]);
}

