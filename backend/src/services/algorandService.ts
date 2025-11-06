/**
 * Service for interacting with Algorand blockchain
 */
import algosdk from 'algosdk';

// Algorand node configuration
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://mainnet-api.4160.nodely.dev';
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const ALGOD_PORT = process.env.ALGOD_PORT || '';

// Initialize Algod client
let algodClient: algosdk.Algodv2 | null = null;

export function getAlgodClient(): algosdk.Algodv2 {
  if (!algodClient) {
    algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
  }
  return algodClient;
}

/**
 * Fetch global state of an application
 */
export async function getApplicationGlobalState(appId: number): Promise<Record<string, any>> {
  try {
    const client = getAlgodClient();
    const appInfo = await client.getApplicationByID(appId).do();
    
    const globalState: Record<string, any> = {};
    
    if (appInfo.params.globalState) {
      for (const item of appInfo.params.globalState) {
        // Handle key - it's a Uint8Array
        const keyBytes = typeof item.key === 'string' ? Buffer.from(item.key, 'base64') : Buffer.from(item.key);
        const key = keyBytes.toString('utf-8');
        let value: any;
        
        if (item.value.type === 1) {
          // Bytes - convert to Buffer
          if (typeof item.value.bytes === 'string') {
            value = Buffer.from(item.value.bytes, 'base64');
          } else {
            value = Buffer.from(item.value.bytes);
          }
        } else if (item.value.type === 2) {
          // Uint
          value = BigInt(item.value.uint);
        }
        
        globalState[key] = value;
      }
    }
    
    return globalState;
  } catch (error) {
    console.error(`Error fetching application ${appId} state:`, error);
    throw error;
  }
}

/**
 * Convert snake_case global state keys to camelCase
 */
export function convertStateToCamelCase(state: Record<string, any>): Record<string, any> {
  const camelCaseState: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(state)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    camelCaseState[camelKey] = value;
  }
  
  return camelCaseState;
}

/**
 * Get token price from oracle contract
 */
export async function getTokenPriceFromOracle(
  oracleAppId: number,
  assetId: number
): Promise<{ price: bigint; lastUpdated: bigint }> {
  try {
    const client = getAlgodClient();
    
    // Construct box name: "prices" prefix + assetId (8 bytes)
    const prefix = Buffer.from('prices');
    const assetIdBuffer = Buffer.alloc(8);
    assetIdBuffer.writeBigUInt64BE(BigInt(assetId));
    const boxName = Buffer.concat([prefix, assetIdBuffer]);
    
    // Get box value
    const boxValue = await client.getApplicationBoxByName(oracleAppId, boxName).do();
    
    // Parse box value: assetId (8 bytes) + price (8 bytes) + lastUpdated (8 bytes)
    const valueBuffer = Buffer.from(boxValue.value);
    
    const price = valueBuffer.readBigUInt64BE(8); // Skip first 8 bytes (assetId)
    const lastUpdated = valueBuffer.readBigUInt64BE(16); // Read last 8 bytes
    
    return { price, lastUpdated };
  } catch (error) {
    console.error(`Error fetching price for asset ${assetId} from oracle ${oracleAppId}:`, error);
    throw error;
  }
}

/**
 * Get asset information
 */
export async function getAssetInfo(assetId: number): Promise<{
  name: string;
  unitName: string;
  decimals: number;
  total: bigint;
  frozen: boolean;
}> {
  try {
    if (assetId === 0) {
      // ALGO special case
      return {
        name: 'Algorand',
        unitName: 'ALGO',
        decimals: 6,
        total: 10_000_000_000n * 1_000_000n, // 10 billion ALGO
        frozen: false,
      };
    }
    
    const client = getAlgodClient();
    const assetInfo = await client.getAssetByID(assetId).do();
    
    return {
      name: assetInfo.params.name || `Asset ${assetId}`,
      unitName: assetInfo.params.unitName || assetInfo.params.name || `ASA${assetId}`,
      decimals: assetInfo.params.decimals || 0,
      total: BigInt(assetInfo.params.total || 0),
      frozen: assetInfo.params.defaultFrozen || false,
    };
  } catch (error) {
    console.error(`Error fetching asset ${assetId} info:`, error);
    throw error;
  }
}

