# Quick Reference - Orbital Lending API Endpoints

## 🎯 All Available Endpoints

### Market Endpoints

| Endpoint | Format | Use Case | Example |
|----------|--------|----------|---------|
| `GET /api/orbital/markets` | Basic DB data | Simple market list | `curl /api/orbital/markets` |
| `GET /api/orbital/markets/details` | Raw numbers | Analytics, calculations | `curl /api/orbital/markets/details?network=mainnet` |
| `GET /api/orbital/markets/canix` | Formatted strings | Display, aggregators | `curl /api/orbital/markets/canix?network=mainnet` |
| `GET /api/orbital/markets/:id` | Basic DB data | Single market info | `curl /api/orbital/markets/123456789` |
| `GET /api/orbital/markets/:id/details` | Raw numbers | Single market analytics | `curl /api/orbital/markets/123456789/details` |
| `POST /api/orbital/markets` | - | Create new market | Admin only |

## 📊 Response Comparison

### Basic Format (`/markets`)
```json
{
  "appId": 123456789,
  "baseTokenId": 0,
  "lstTokenId": 987654321,
  "network": "mainnet"
}
```

### Detailed Format (`/markets/details`)
```json
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
```

### Canix Format (`/markets/canix`)
```json
{
  "platform": "Orbital Lending",
  "logo": "/orbital-icon.svg",
  "url": "https://app.orbitallending.com",
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
}
```

## 🚀 Quick Start

```bash
# Clone and setup
cd backend
npm install

# Configure (optional)
cp env.template .env
# Edit .env if needed

# Build and run
npm run build
npm start

# Test endpoints
curl http://localhost:3000/api/orbital/markets/canix?network=mainnet
```

## 🔗 Use Cases

| Need | Use This Endpoint |
|------|-------------------|
| Display yields in a table | `/markets/canix` |
| Calculate portfolio value | `/markets/details` |
| List available markets | `/markets` |
| Build analytics dashboard | `/markets/details` |
| External aggregator integration | `/markets/canix` |
| Single market deep dive | `/markets/:id/details` |

## 📖 Documentation

- **Detailed API**: See `MARKET_DETAILS_API.md`
- **Canix Format**: See `CANIX_API.md`
- **Overview**: See `API_SUMMARY.md`

## ⚡ Quick Examples

### JavaScript/TypeScript
```typescript
// Canix format (for display)
const res = await fetch('/api/orbital/markets/canix?network=mainnet');
const { data } = await res.json();
console.log(data[0].yield); // "5.25%"

// Detailed format (for calculations)
const res = await fetch('/api/orbital/markets/details?network=mainnet');
const { data } = await res.json();
console.log(data[0].supplyApy); // 5.25
```

### Python
```python
# Canix format
response = requests.get('/api/orbital/markets/canix?network=mainnet')
data = response.json()['data']
print(data[0]['yield'])  # "5.25%"

# Detailed format
response = requests.get('/api/orbital/markets/details?network=mainnet')
data = response.json()['data']
print(data[0]['supplyApy'])  # 5.25
```

## 🎨 TVL Formatting

| Value | Canix Format | Details Format |
|-------|-------------|---------------|
| $456.78 | `"$456.78"` | `456.78` |
| $12,500 | `"$12.50K"` | `12500.00` |
| $1,500,000 | `"$1.50M"` | `1500000.00` |
| $2,250,000,000 | `"$2.25B"` | `2250000000.00` |

## 🏷️ Asset Types

Automatically categorized in Canix format:
- **Native**: ALGO
- **Stablecoin**: USDC, USDT, xUSD
- **Wrapped**: goBTC, wBTC
- **Asset**: Everything else

