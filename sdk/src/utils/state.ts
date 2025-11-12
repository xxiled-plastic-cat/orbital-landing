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
  
  // The API returns the value as a base64-encoded string
  // We need to decode it to get the raw bytes
  if (typeof boxResponse.value === 'string') {
    try {
      return new Uint8Array(Buffer.from(boxResponse.value, 'base64'));
    } catch (error) {
      throw new Error(
        `Failed to decode box value from base64: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  // If it's already a Uint8Array, return it directly
  if (boxResponse.value instanceof Uint8Array) {
    return boxResponse.value;
  }
  
  // If it's an array-like object, convert it
  const value = boxResponse.value;
  if (Array.isArray(value) || (value && typeof value === 'object' && 'length' in value)) {
    return new Uint8Array(value as ArrayLike<number>);
  }
  
  throw new Error(
    `Unexpected box value type: ${typeof boxResponse.value}. Expected string (base64) or Uint8Array.`
  );
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
  // Note: The deposit record structure is [depositAmount, assetId]
  // This matches the contract's ABI structure
  const depositRecordType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64), // depositAmount (first)
    new algosdk.ABIUintType(64), // assetId (second)
  ]);

  const decoded = depositRecordType.decode(boxValue) as bigint[];
  return {
    depositAmount: decoded[0], // First element is depositAmount
    assetId: decoded[1],       // Second element is assetId
  };
}

/**
 * Decode loan record box
 * @param boxValue Raw box value
 * @returns Decoded loan record
 */
export function decodeLoanRecord(boxValue: Uint8Array): {
  borrowerAddress: string;
  collateralTokenId: bigint;
  collateralAmount: bigint;
  lastDebtChange: {
    amount: bigint;
    changeType: number;
    timestamp: bigint;
  };
  borrowedTokenId: bigint;
  principal: bigint;
  userIndexWad: bigint;
} {
  const loanRecordType = new algosdk.ABITupleType([
    new algosdk.ABIAddressType(), // borrowerAddress
    new algosdk.ABIUintType(64), // collateralTokenId
    new algosdk.ABIUintType(64), // collateralAmount
    new algosdk.ABITupleType([
      new algosdk.ABIUintType(64), // lastDebtChange.amount
      new algosdk.ABIUintType(8),  // lastDebtChange.changeType
      new algosdk.ABIUintType(64), // lastDebtChange.timestamp
    ]),
    new algosdk.ABIUintType(64), // borrowedTokenId
    new algosdk.ABIUintType(64), // principal
    new algosdk.ABIUintType(64), // userIndexWad
  ]);

  const decoded = loanRecordType.decode(boxValue) as any[];
  
  // Handle borrower address - could be string or Uint8Array depending on algosdk version
  const borrowerAddressRaw = decoded[0];
  const borrowerAddress = typeof borrowerAddressRaw === 'string' 
    ? borrowerAddressRaw 
    : algosdk.encodeAddress(borrowerAddressRaw as Uint8Array);
  
  const lastDebtChange = decoded[3] as bigint[];

  return {
    borrowerAddress,
    collateralTokenId: decoded[1],
    collateralAmount: decoded[2],
    lastDebtChange: {
      amount: lastDebtChange[0],
      changeType: Number(lastDebtChange[1]),
      timestamp: lastDebtChange[2],
    },
    borrowedTokenId: decoded[4],
    principal: decoded[5],
    userIndexWad: decoded[6],
  };
}

/**
 * Create deposit record box name
 * @param userAddress User's Algorand address
 * @param assetId Asset ID
 * @returns Box name as Uint8Array
 */
export function createDepositBoxName(userAddress: string, assetId: bigint | number): Uint8Array {
  // Ensure assetId is a bigint and within uint64 range
  const assetIdBigInt = typeof assetId === 'number' ? BigInt(assetId) : assetId;
  
  // Validate uint64 range (0 to 2^64 - 1)
  if (assetIdBigInt < 0n || assetIdBigInt > 18446744073709551615n) {
    throw new Error(`Asset ID ${assetIdBigInt} is out of uint64 range`);
  }
  
  const depositKeyType = new algosdk.ABITupleType([
    new algosdk.ABIAddressType(),
    new algosdk.ABIUintType(64), // assetId
  ]);
  const prefix = new TextEncoder().encode('deposit_record');
  
  try {
    // Decode address and ensure publicKey is a Uint8Array
    const decodedAddress = algosdk.decodeAddress(userAddress);
    const publicKey = decodedAddress.publicKey instanceof Uint8Array
      ? decodedAddress.publicKey
      : new Uint8Array(decodedAddress.publicKey);
    
    // Encode the tuple: [address publicKey, assetId]
    const encodedKey = depositKeyType.encode([
      publicKey,
      assetIdBigInt,
    ]);
    return new Uint8Array([...prefix, ...encodedKey]);
  } catch (error) {
    throw new Error(
      `Failed to encode deposit box name for address ${userAddress}, assetId ${assetIdBigInt}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
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

/**
 * Decode oracle price box
 * @param boxValue Raw box value
 * @returns Decoded oracle price data
 */
export function decodeOraclePrice(boxValue: Uint8Array): {
  assetId: bigint;
  price: bigint;
  lastUpdated: bigint;
} {
  const oraclePriceType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64), // assetId
    new algosdk.ABIUintType(64), // price
    new algosdk.ABIUintType(64), // lastUpdated
  ]);

  const decoded = oraclePriceType.decode(boxValue) as bigint[];
  return {
    assetId: decoded[0],
    price: decoded[1],
    lastUpdated: decoded[2],
  };
}

/**
 * Create oracle price box name
 * @param assetId Asset ID to get price for
 * @returns Box name as Uint8Array
 */
export function createOraclePriceBoxName(assetId: number): Uint8Array {
  const prefix = new TextEncoder().encode('prices');
  
  // Encode assetId as uint64 (8 bytes, big-endian)
  const assetIdBytes = new Uint8Array(8);
  const view = new DataView(assetIdBytes.buffer);
  view.setBigUint64(0, BigInt(assetId), false); // false = big-endian
  
  return new Uint8Array([...prefix, ...assetIdBytes]);
}

