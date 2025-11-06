# Market Details API

This document describes the new API endpoints for fetching enriched market data from the Orbital Lending backend.

## Overview

The Market Details API provides comprehensive information about lending markets, including:
- **APY** (Annual Percentage Yield) for supply and borrow
- **TVL** (Total Value Locked) in USD and base token
- **Base Token ID** and **Base Token Name**
- Real-time utilization rates
- Available liquidity
- Token prices

All data is fetched on-chain from Algorand smart contracts and enriched with metadata.

## Endpoints

### 1. Get All Markets with Details

Fetch enriched data for all markets.

**Endpoint:** `GET /api/orbital/markets/details`

**Query Parameters:**
- `network` (optional): Filter by network (`mainnet` or `testnet`)

**Example Request:**
```bash
# Get all mainnet markets
curl http://localhost:3000/api/orbital/markets/details?network=mainnet

# Get all markets (both mainnet and testnet)
curl http://localhost:3000/api/orbital/markets/details
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "appId": 123456789,
      "baseTokenId": 0,
      "baseTokenName": "Algorand",
      "baseTokenSymbol": "ALGO",
      "lstTokenId": 987654321,
      "network": "mainnet",
      "supplyApy": 5.25,
      "borrowApy": 8.75,
      "tvl": 1500000.50,
      "tvlBaseToken": "1234567.890000",
      "totalDeposits": "1234567.890000",
      "totalBorrows": "456789.123000",
      "utilizationRate": 37.00,
      "availableToBorrow": "777778.767000",
      "baseTokenPrice": 1.215000,
      "totalBorrowsUSD": 555000.00,
      "availableToBorrowUSD": 945000.50
    }
  ],
  "count": 1
}
```

### 2. Get Market Details by ID

Fetch enriched data for a specific market by application ID.

**Endpoint:** `GET /api/orbital/markets/:id/details`

**Path Parameters:**
- `id`: The Algorand application ID of the market

**Example Request:**
```bash
curl http://localhost:3000/api/orbital/markets/123456789/details
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "appId": 123456789,
    "baseTokenId": 0,
    "baseTokenName": "Algorand",
    "baseTokenSymbol": "ALGO",
    "lstTokenId": 987654321,
    "network": "mainnet",
    "supplyApy": 5.25,
    "borrowApy": 8.75,
    "tvl": 1500000.50,
    "tvlBaseToken": "1234567.890000",
    "totalDeposits": "1234567.890000",
    "totalBorrows": "456789.123000",
    "utilizationRate": 37.00,
    "availableToBorrow": "777778.767000",
    "baseTokenPrice": 1.215000,
    "totalBorrowsUSD": 555000.00,
    "availableToBorrowUSD": 945000.50
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `appId` | number | Algorand application ID of the market |
| `baseTokenId` | number | Asset ID of the base token (0 for ALGO) |
| `baseTokenName` | string | Full name of the base token |
| `baseTokenSymbol` | string | Symbol/unit name of the base token |
| `lstTokenId` | number | Asset ID of the LST (Liquid Staking Token) |
| `network` | string | Network the market is on (`mainnet` or `testnet`) |
| `supplyApy` | number | Annual Percentage Yield for suppliers (%) |
| `borrowApy` | number | Annual Percentage Yield for borrowers (%) |
| `tvl` | number | Total Value Locked in USD |
| `tvlBaseToken` | string | TVL in base token units (formatted string) |
| `totalDeposits` | string | Total deposits in base token units |
| `totalBorrows` | string | Total borrows in base token units |
| `utilizationRate` | number | Utilization rate as percentage (0-100) |
| `availableToBorrow` | string | Available liquidity in base token units |
| `baseTokenPrice` | number | Current price of base token in USD |
| `totalBorrowsUSD` | number | Total borrows value in USD |
| `availableToBorrowUSD` | number | Available liquidity value in USD |

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid network parameter",
  "message": "Network must be either \"mainnet\" or \"testnet\""
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Market not found",
  "message": "Market with app ID 123456789 not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch market details",
  "message": "Error details here"
}
```

## Implementation Details

### APY Calculation

The API calculates APY using the Kinked Interest Rate Model:
- **Borrow APY**: Calculated directly from the interest rate curve based on current utilization
- **Supply APY**: `borrowAPY × utilization × (1 - protocolFee)`

### TVL Calculation

TVL is calculated as:
```
TVL (USD) = Total Deposits (base token) × Base Token Price (USD)
```

Token prices are fetched from the on-chain oracle contract.

### Data Sources

1. **Market Registry**: PostgreSQL database (market metadata)
2. **On-chain State**: Algorand smart contracts (deposits, borrows, parameters)
3. **Token Prices**: Oracle smart contract (USD prices)
4. **Token Metadata**: Algorand blockchain (asset info)

## Configuration

Set these environment variables in your `.env` file:

```bash
# Algorand node (defaults to Nodely public API)
ALGOD_SERVER=https://mainnet-api.4160.nodely.dev
ALGOD_TOKEN=
ALGOD_PORT=
```

## Notes

- All numeric string values (like `totalDeposits`) preserve full precision
- Numeric percentages (like `supplyApy`) are rounded to 2 decimal places
- USD values are rounded to 2 decimal places
- The API fetches real-time on-chain data, so response times may vary
- Failed market enrichments are logged but don't fail the entire request

## Legacy Endpoints

The original market endpoints remain available:
- `GET /api/orbital/markets` - List all markets (basic info)
- `GET /api/orbital/markets/:id` - Get market by ID (basic info)
- `POST /api/orbital/markets` - Create new market

These endpoints only return database values without on-chain enrichment.

