/**
 * Service for handling deposit record box operations
 */
import algosdk from 'algosdk';
import { getAlgodClient } from './algorandService';
import { OrbitalLendingClient } from '../contracts/orbital-lendingClient';
import type { DepositRecord, DepositRecordKey } from '../contracts/orbital-lendingClient';
import * as algokit from '@algorandfoundation/algokit-utils';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';


interface CopyDepositRecordsParams {
  sourceAppId: number;
  targetAppId: number;
}

interface DepositRecordMigrationData {
  userAddress: string;
  assetId: bigint;
  depositAmount: bigint;
}

interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Copies all deposit records from source contract to target contract
 * Uses the addDepositRecordExternal method on the target contract
 * 
 * This function:
 * 1. Gets all deposit records from source contract state
 * 2. Calls addDepositRecordExternal on target contract for each record
 * 3. Returns the results of the migration
 */
export async function copyDepositRecords(
  params: CopyDepositRecordsParams
): Promise<ServiceResponse<{
  depositRecords: DepositRecordMigrationData[];
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  results: Array<{
    userAddress: string;
    assetId: bigint;
    depositAmount: bigint;
    success: boolean;
    transactionId?: string;
    error?: string;
  }>;
  sourceAppId: number;
  targetAppId: number;
}>> {
  try {
    const { sourceAppId, targetAppId } = params;

    // Validate inputs
    if (!sourceAppId || !targetAppId) {
      return {
        success: false,
        data: null,
        error: 'Source and target app IDs are required',
      };
    }

    // Validate required environment variables
    if (!process.env.MARKET_ADMIN_MNEMONIC) {
      return {
        success: false,
        data: null,
        error: 'MARKET_ADMIN_MNEMONIC environment variable not set',
      };
    }

    if (!process.env.MARKET_ADMIN_ADDRESS) {
      return {
        success: false,
        data: null,
        error: 'MARKET_ADMIN_ADDRESS environment variable not set',
      };
    }

    // Setup Algorand client using algokit (similar to oracleService)
    const algorand = algokit.AlgorandClient.fromConfig({
      algodConfig: {
        server:
          process.env.ALGORAND_NODE_URL ||
          (process.env.ALGORAND_NETWORK === 'mainnet'
            ? 'https://mainnet-api.4160.nodely.dev'
            : 'https://testnet-api.4160.nodely.dev'),
        token: 'F10D011013C676F2EAEC6EBBFD82DC63',
      },
    });

    // Setup market admin account
    const account = algorand.account.fromMnemonic(
      process.env.MARKET_ADMIN_MNEMONIC as string,
      process.env.MARKET_ADMIN_ADDRESS as string
    );
    algorand.setDefaultSigner(account);

    // Get signer from algokit account (for use with algosdk clients)
    const signer = account.signer;

    const algodClient = getAlgodClient();

    // Create app client for source contract to read state
    const sourceClient = new OrbitalLendingClient({
      algorand, // your AlgorandClient instance
      appId: BigInt(sourceAppId), // the application ID
      defaultSender: account.addr,
      defaultSigner: signer,
    }); 

    // Create app client for target contract to write state
    const targetClient = new OrbitalLendingClient({
      algorand, // your AlgorandClient instance
      appId: BigInt(targetAppId), // the application ID
      defaultSender: account.addr,
      defaultSigner: signer,
    }); 

    // Get all deposit records from source contract state
    const depositRecordsMap = await sourceClient.state.box.depositRecord.getMap();

    if (!depositRecordsMap || depositRecordsMap.size === 0) {
      return {
        success: true,
        data: {
          depositRecords: [],
          totalRecords: 0,
          successfulRecords: 0,
          failedRecords: 0,
          results: [],
          sourceAppId,
          targetAppId,
        },
      };
    }

    // Prepare migration data and results
    const depositRecords: DepositRecordMigrationData[] = [];
    const results: Array<{
      userAddress: string;
      assetId: bigint;
      depositAmount: bigint;
      success: boolean;
      transactionId?: string;
      error?: string;
    }> = [];

    let successfulRecords = 0;
    let failedRecords = 0;

    // Loop through each deposit record and call addDepositRecordExternal
    for (const [key, record] of depositRecordsMap.entries()) {
      const depositRecordKey = key as DepositRecordKey;
      const depositRecord = record as DepositRecord;

      // Skip if deposit amount is zero
      if (depositRecord.depositAmount === 0n) {
        continue;
      }

      // Add to migration data
      depositRecords.push({
        userAddress: depositRecordKey.userAddress,
        assetId: depositRecord.assetId,
        depositAmount: depositRecord.depositAmount,
      });

      // Call addDepositRecordExternal on target contract
      try {
        const result = await targetClient.send.addDepositRecordExternal({
          args: {
            userAddress: depositRecordKey.userAddress,
            assetId: depositRecord.assetId,
            depositAmount: depositRecord.depositAmount,

          },
          maxFee: AlgoAmount.MicroAlgos(250_000),
          coverAppCallInnerTransactionFees: true,
          populateAppCallResources: true,
          signer,
          sender: account.addr,
        });

        successfulRecords++;
        results.push({
          userAddress: depositRecordKey.userAddress,
          assetId: depositRecord.assetId,
          depositAmount: depositRecord.depositAmount,
          success: true,
          transactionId: result.transaction.txID(),
        });

        console.log(`✅ Successfully migrated deposit record for user ${depositRecordKey.userAddress}, assetId ${depositRecord.assetId.toString()}, amount ${depositRecord.depositAmount.toString()}`);
      } catch (error) {
        failedRecords++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({
          userAddress: depositRecordKey.userAddress,
          assetId: depositRecord.assetId,
          depositAmount: depositRecord.depositAmount,
          success: false,
          error: errorMessage,
        });

        console.error(`❌ Failed to migrate deposit record for user ${depositRecordKey.userAddress}, assetId ${depositRecord.assetId.toString()}:`, errorMessage);
      }
    }

    return {
      success: true,
      data: {
        depositRecords,
        totalRecords: depositRecords.length,
        successfulRecords,
        failedRecords,
        results,
        sourceAppId,
        targetAppId,
      },
    };
  } catch (error) {
    console.error('Error copying deposit records:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Gets all deposit records from a contract (for inspection/debugging)
 */
export async function getAllDepositRecords(
  appId: number
): Promise<ServiceResponse<DepositRecordMigrationData[]>> {
  try {
    if (!appId) {
      return {
        success: false,
        data: null,
        error: 'App ID is required',
      };
    }

    const algodClient = getAlgodClient();

    // Create app client
    // Using direct constructor - algodClient is passed via the algod property
    const client = new OrbitalLendingClient({
      id: BigInt(appId),
      resolveBy: 'id',
      algod: algodClient,
    } as any); // Type assertion needed due to strict typing

    // Get all deposit records from contract state
    const depositRecordsMap = await client.state.box.depositRecord.getMap();

    const depositRecords: DepositRecordMigrationData[] = [];

    // Convert map entries to array
    for (const [key, record] of depositRecordsMap.entries()) {
      const depositRecordKey = key as DepositRecordKey;
      const depositRecord = record as DepositRecord;

      // Skip if deposit amount is zero
      if (depositRecord.depositAmount === 0n) {
        continue;
      }

      depositRecords.push({
        userAddress: depositRecordKey.userAddress,
        assetId: depositRecord.assetId,
        depositAmount: depositRecord.depositAmount,
      });
    }

    return {
      success: true,
      data: depositRecords,
    };
  } catch (error) {
    console.error('Error getting deposit records:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
