# Deposit Box API

API endpoints for managing deposit record box references, specifically for copying box refs between contracts during migration.

## Endpoints

### POST `/api/orbital/deposit-boxes/copy-refs`

Copies deposit record box refs from one contract to another. This endpoint retrieves the box reference from the source contract and creates the corresponding box reference for the target contract.

**Note:** This endpoint only creates the box references. The actual copying/migration must be done via a contract call that includes these box refs.

#### Request Body

```json
{
  "sourceAppId": 123456,
  "targetAppId": 789012,
  "userAddress": "ALGORAND_ADDRESS",
  "assetId": 0
}
```

#### Parameters

- `sourceAppId` (number, required): The application ID of the source contract
- `targetAppId` (number, required): The application ID of the target contract
- `userAddress` (string, required): The Algorand address of the user
- `assetId` (number | string, required): The asset ID (0 for ALGO)

#### Response

```json
{
  "success": true,
  "data": {
    "sourceBoxRef": {
      "appIndex": 123456,
      "name": [100, 101, 112, ...] // Uint8Array as array
    },
    "targetBoxRef": {
      "appIndex": 789012,
      "name": [100, 101, 112, ...] // Uint8Array as array
    },
    "depositRecord": {
      "depositAmount": "1000000",
      "assetId": "0"
    }
  }
}
```

#### Example Usage

```bash
curl -X POST http://localhost:3000/api/orbital/deposit-boxes/copy-refs \
  -H "Content-Type: application/json" \
  -d '{
    "sourceAppId": 123456,
    "targetAppId": 789012,
    "userAddress": "ALGORAND_ADDRESS",
    "assetId": 0
  }'
```

### GET `/api/orbital/deposit-boxes/user/:userAddress`

Gets all deposit box refs for a user across specified asset IDs.

#### Query Parameters

- `appId` (number, required): The application ID to query
- `assetIds` (string, optional): Comma-separated list of asset IDs (defaults to "0" for ALGO)

#### Example Usage

```bash
# Get deposit box refs for ALGO (default)
curl "http://localhost:3000/api/orbital/deposit-boxes/user/ALGORAND_ADDRESS?appId=123456"

# Get deposit box refs for multiple assets
curl "http://localhost:3000/api/orbital/deposit-boxes/user/ALGORAND_ADDRESS?appId=123456&assetIds=0,123,456"
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "appIndex": 123456,
      "name": [100, 101, 112, ...]
    },
    {
      "appIndex": 123456,
      "name": [100, 101, 112, ...]
    }
  ]
}
```

## Usage in Migration

When migrating deposit records from one contract to another, you would:

1. Call `copyDepositBoxRefs` to get the box references
2. Use these box refs in your migration transaction (e.g., `acceptMigrationAlgoContract`)
3. The box refs ensure the transaction can read from the source contract and write to the target contract

### Example Integration

```typescript
// Get box refs
const response = await fetch('/api/orbital/deposit-boxes/copy-refs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceAppId: oldAppId,
    targetAppId: newAppId,
    userAddress: userAddress,
    assetId: 0
  })
});

const { sourceBoxRef, targetBoxRef, depositRecord } = response.data;

// Use box refs in migration transaction
// Note: You'll need to convert the box refs to the format expected by algosdk
const sourceBoxRefAlgoSDK: algosdk.BoxReference = {
  appIndex: sourceBoxRef.appIndex,
  name: new Uint8Array(sourceBoxRef.name)
};

const targetBoxRefAlgoSDK: algosdk.BoxReference = {
  appIndex: targetBoxRef.appIndex,
  name: new Uint8Array(targetBoxRef.name)
};

// Include these box refs in your transaction's box references array
```

## Notes

- This API is specific to ALGO contracts (baseTokenId === '0')
- Box refs are used to allow transactions to read/write boxes from different contracts
- The actual migration logic must be implemented in your contract calls
- Box names are deterministic based on user address and asset ID
