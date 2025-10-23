# Orbital Backend - Quick Start Guide

## ✅ What Was Built

A simplified Node.js backend that matches your legacy API structure with 2 simple tables:

1. **orbital_lending_markets** - Stores market information (appId, baseTokenId, lstTokenId)
2. **orbital_lending_user_record** - Stores user transaction records

## 🚀 Backend Setup

### 1. Start Backend

```bash
cd backend
npm install
cp env.template .env
# Edit .env with your Supabase connection string

# Run migrations
npm run migrate:up

# Start server
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Test Backend

```bash
# Health check
curl http://localhost:3000/api/health

# Get markets
curl http://localhost:3000/api/orbital/markets

# Create a market
curl -X POST http://localhost:3000/api/orbital/markets \
  -H "Content-Type: application/json" \
  -d '{"appId":748146169,"baseTokenId":744427912,"lstTokenId":748153199}'
```

## 🎨 Frontend Setup

### 1. Configure Frontend

```bash
cd frontend
cp env.template .env
```

Edit `.env`:
```
VITE_NETWORK=testnet
VITE_NETWORK_TOKEN=your_token
VITE_ORBITAL_BACKEND_URL=http://localhost:3000/api
```

### 2. Start Frontend

```bash
npm run dev
```

## 📊 API Endpoints

All endpoints are at `http://localhost:3000/api`

### Markets
- `GET /orbital/markets` - Get all markets
- `GET /orbital/markets/:id` - Get specific market
- `POST /orbital/markets` - Create market

### User Records  
- `POST /orbital/records` - Create user record
- `GET /orbital/records/market/:marketId` - Get market records
- `GET /orbital/records/:address/:marketId` - Get user records for market
- `POST /orbital/records/:address/:marketId/stats` - Get user stats
- `GET /orbital/records/:address` - Get all user records

## 🗄️ Database Tables

### orbital_lending_markets
```sql
appId         BIGINT (PRIMARY KEY)
baseTokenId   BIGINT
lstTokenId    BIGINT
```

### orbital_lending_user_record
```sql
address     STRING (PRIMARY KEY)
marketId    BIGINT (PRIMARY KEY)
timestamp   BIGINT (PRIMARY KEY)
action      STRING
tokenInId   BIGINT
tokenOutId  BIGINT
tokensIn    REAL
tokensOut   REAL
txnId       STRING
```

## 🔧 Service Functions

### Market Service (`marketService.js`)
```javascript
- getOrbitalLendingMarkets()
- getOrbitalLendingMarketById(id)
- addOrbitalLendingMarket(appId, baseTokenId, lstTokenId)
```

### User Record Service (`userRecordService.js`)
```javascript
- addUserRecord(body)
- getUserRecordsByMarketId(marketId)
- getUserRecordsByAddressAndMarketId(address, marketId)
- getUserStatsForMarket(address, marketId, baseTokenId, lstTokenId, collateralIds)
- getUserStats(address)
```

## 📝 Example: Create User Record

```bash
curl -X POST http://localhost:3000/api/orbital/records \
  -H "Content-Type: application/json" \
  -d '{
    "address": "ALGORAND_ADDRESS",
    "marketId": 748146169,
    "action": "supply",
    "tokenInId": 744427912,
    "tokenOutId": 748153199,
    "tokensIn": 100.5,
    "tokensOut": 100.5,
    "timestamp": 1698012345,
    "txnId": "TXN_ID"
  }'
```

## 📝 Example: Get User Stats

```bash
curl -X POST http://localhost:3000/api/orbital/records/ALGORAND_ADDRESS/748146169/stats \
  -H "Content-Type: application/json" \
  -d '{
    "baseTokenId": 744427912,
    "lstTokenId": 748153199,
    "acceptedCollateralTokenIds": [748153199, 748156049]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "baseToken": { "in": 100.5, "out": 50.0 },
    "lstToken": { "in": 50.0, "out": 100.5 },
    "collateral": {
      "748153199": { "in": 10.0, "out": 5.0 },
      "748156049": { "in": 20.0, "out": 0.0 }
    }
  }
}
```

## 🔄 Migration Commands

```bash
# Run migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Check migration status
npm run migrate:status
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── OrbitalLendingMarket.js
│   │   └── OrbitalLendingUserRecord.js
│   ├── services/
│   │   ├── marketService.js
│   │   └── userRecordService.js
│   ├── controllers/
│   │   ├── marketController.js
│   │   └── userRecordController.js
│   ├── routes/
│   │   ├── markets.js
│   │   └── records.js
│   ├── migrations/
│   │   └── 20241023000001-create-orbital-tables.js
│   └── server.js
└── package.json

frontend/
├── src/
│   ├── services/
│   │   ├── orbitalApi.ts      # New API client
│   │   ├── markets.ts          # Updated to use new backend
│   │   └── userStats.ts        # Updated to use new backend
│   └── constants/
│       └── constants.ts        # Added ORBITAL_BACKEND_URL
└── env.template
```

## ✨ What Changed from Complex Backend

**Removed:**
- Complex loan/deposit tracking models
- Separate user stats table
- Timestamps and metadata fields

**Simplified to:**
- 2 simple tables matching legacy schema
- Direct transaction recording
- Clean accessor functions

## 🎯 Ready to Use

Both backend and frontend are now configured and ready to use. The backend matches your legacy API structure exactly, making migration seamless!

