# Canix Aggregator Format API

## Overview

This endpoint provides Orbital Lending market data formatted specifically for the Canix DeFi aggregator format, making it easy to integrate with external yield aggregation platforms.

## Endpoint

### GET /api/orbital/markets/canix

Returns all Orbital Lending markets in standardized aggregator format.

**Query Parameters:**
- `network` (optional): Filter by network (`mainnet` or `testnet`)

## Request Examples

```bash
# Get all mainnet markets in Canix format
curl "http://localhost:3000/api/orbital/markets/canix?network=mainnet"

# Get all markets (both networks)
curl "http://localhost:3000/api/orbital/markets/canix"
```

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "platform": "Orbital Lending",
      "logo": "/orbital-icon.svg",
      "url": "https://orbital.compx.io",
      "asset": "Algorand",
      "assetType": "Native",
      "yieldType": "Lending",
      "yield": "5.25%",
      "tvl": "$1.50M",
      "rewards": "None",
      "borrowApy": "8.75%",
      "utilizationRate": "37.00%",
      "network": "mainnet",
      "appId": 123456789,
      "baseTokenId": 0,
      "baseTokenSymbol": "ALGO"
    },
    {
      "platform": "Orbital Lending",
      "logo": "/orbital-icon.svg",
      "url": "https://orbital.compx.io",
      "asset": "USD Coin",
      "assetType": "Stablecoin",
      "yieldType": "Lending",
      "yield": "12.50%",
      "tvl": "$850.25K",
      "rewards": "None",
      "borrowApy": "15.75%",
      "utilizationRate": "68.30%",
      "network": "mainnet",
      "appId": 987654321,
      "baseTokenId": 31566704,
      "baseTokenSymbol": "USDC"
    }
  ],
  "count": 2
}
```

## Response Fields

### Core Fields (Canix Format)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `platform` | string | Protocol name | `"Orbital Lending"` |
| `logo` | string | Path to platform logo | `"/orbital-icon.svg"` |
| `url` | string | Platform URL | `"https://orbital.compx.io"` |
| `asset` | string | Asset name | `"Algorand"` |
| `assetType` | string | Asset category | `"Native"`, `"Stablecoin"`, `"Wrapped"`, `"Asset"` |
| `yieldType` | string | Type of yield | `"Lending"` |
| `yield` | string | Supply APY (formatted) | `"5.25%"` |
| `tvl` | string | Total Value Locked (formatted) | `"$1.50M"` |
| `rewards` | string | Reward tokens | `"None"` (Orbital currently has no rewards) |

### Additional Fields (Orbital-specific)

| Field | Type | Description |
|-------|------|-------------|
| `borrowApy` | string | Borrow APY (formatted) |
| `utilizationRate` | string | Current utilization rate |
| `network` | string | `"mainnet"` or `"testnet"` |
| `appId` | number | Algorand application ID |
| `baseTokenId` | number | Base token asset ID |
| `baseTokenSymbol` | string | Base token symbol |

## Asset Type Categorization

Assets are automatically categorized based on their name:

| Asset Type | Criteria |
|------------|----------|
| **Native** | Contains "algo" |
| **Stablecoin** | Contains "usdc", "usdt", or "xusd" |
| **Wrapped** | Contains "btc" or "gobtc" |
| **Asset** | Default for all others |

## TVL Formatting

TVL values are formatted with appropriate suffixes:

| Range | Format | Example |
|-------|--------|---------|
| < $1,000 | `$X.XX` | `$456.78` |
| $1K - $999K | `$X.XXK` | `$12.50K` |
| $1M - $999M | `$X.XXM` | `$1.50M` |
| $1B+ | `$X.XXB` | `$2.25B` |

## Integration Example

### JavaScript/TypeScript

```typescript
interface CanixMarket {
  platform: string;
  logo: string;
  url: string;
  asset: string;
  assetType: string;
  yieldType: string;
  yield: string;
  tvl: string;
  rewards: string;
  borrowApy?: string;
  utilizationRate?: string;
  network?: string;
  appId?: number;
  baseTokenId?: number;
  baseTokenSymbol?: string;
}

async function fetchOrbitalMarkets(): Promise<CanixMarket[]> {
  const response = await fetch(
    'https://api.orbitallending.com/api/orbital/markets/canix?network=mainnet'
  );
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  }
  
  throw new Error('Failed to fetch markets');
}

// Use the data
const markets = await fetchOrbitalMarkets();
markets.forEach(market => {
  console.log(`${market.asset}: ${market.yield} APY, ${market.tvl} TVL`);
});
```

### Python

```python
import requests

def fetch_orbital_markets(network='mainnet'):
    url = f'https://api.orbitallending.com/api/orbital/markets/canix'
    params = {'network': network}
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data.get('success'):
        return data['data']
    
    raise Exception('Failed to fetch markets')

# Use the data
markets = fetch_orbital_markets()
for market in markets:
    print(f"{market['asset']}: {market['yield']} APY, {market['tvl']} TVL")
```

## Comparison: Canix Format vs. Detailed Format

| Endpoint | Use Case | Format |
|----------|----------|--------|
| `/markets/canix` | External aggregators, simple displays | Formatted strings with units |
| `/markets/details` | Calculations, analytics, advanced integrations | Raw numbers with full precision |

**Example:**

```json
// Canix format (/markets/canix)
{
  "yield": "5.25%",
  "tvl": "$1.50M"
}

// Detailed format (/markets/details)
{
  "supplyApy": 5.25,
  "tvl": 1500000.50
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid network parameter",
  "message": "Network must be either \"mainnet\" or \"testnet\""
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch market data",
  "message": "Error details here"
}
```

## Notes

- All yield and APY values are rounded to 2 decimal places
- TVL formatting automatically adjusts for magnitude (K, M, B)
- Asset type categorization is automatic and case-insensitive
- The `rewards` field is currently always "None" as Orbital doesn't have reward tokens
- Additional Orbital-specific fields are included for enhanced functionality
- Data is fetched in real-time from on-chain sources

## Related Endpoints

- `/api/orbital/markets/details` - Full detailed format with raw numbers
- `/api/orbital/markets/:id/details` - Single market detailed format
- `/api/orbital/markets` - Basic market list from database

## Support

For questions or issues with the API, please contact the Orbital Lending team or open an issue on GitHub.

