# Orbital Lending API Backend

A dedicated Node.js backend API for the Orbital Lending Protocol on Algorand, built with Express.js, Sequelize ORM, and PostgreSQL (Supabase).

## Overview

This backend provides REST API endpoints for Orbital Lending markets and user transaction records, matching the legacy general backend API structure.

It also includes an **Oracle Price Update Service** that runs as a standalone cron job to fetch and update asset prices from multiple DEX sources (CompX, Vestige).

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Language:** TypeScript (for oracle services) + JavaScript
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL (Supabase)
- **Security:** Helmet, CORS, Express Rate Limit
- **Cron:** node-cron (for oracle price updates)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── models/
│   │   ├── index.js             # Model exports
│   │   ├── OrbitalLendingMarket.js
│   │   └── OrbitalLendingUserRecord.js
│   ├── services/
│   │   ├── marketService.js     # Market business logic
│   │   └── userRecordService.js # User record business logic
│   ├── controllers/
│   │   ├── marketController.js  # Market route handlers
│   │   └── userRecordController.js
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── markets.js           # Market routes
│   │   └── records.js           # User record routes
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling
│   │   └── rateLimiter.js       # Rate limiting
│   ├── migrations/
│   │   ├── runner.js            # Migration runner
│   │   └── 20241023000001-create-orbital-tables.js
│   ├── app.js                   # Express app
│   └── server.js                # Server entry point
├── env.template
├── package.json
└── README.md
```

## Database Schema

### orbital_lending_markets
```
appId (BIGINT, PRIMARY KEY) - Market application ID
baseTokenId (BIGINT)        - Base token asset ID
lstTokenId (BIGINT)         - LST token asset ID
```

### orbital_lending_user_record
```
address (STRING, PRIMARY KEY)   - User Algorand address
marketId (BIGINT, PRIMARY KEY)  - Market application ID
timestamp (BIGINT, PRIMARY KEY) - Unix timestamp
action (STRING)                 - Action type (supply, borrow, etc.)
tokenInId (BIGINT)             - Input token asset ID
tokenOutId (BIGINT)            - Output token asset ID
tokensIn (REAL)                - Input token amount
tokensOut (REAL)               - Output token amount
txnId (STRING)                 - Transaction ID
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp env.template .env
```

Edit `.env` with your Supabase connection string:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### 3. Run Migrations

```bash
npm run migrate:up
```

### 4. Start Server

#### API Server

```bash
# Development (with auto-reload)
npm run dev

# Production (builds TypeScript, runs migrations, starts server)
npm start

# Or just start the server (without migrations)
npm run start:server
```

Server will start on `http://localhost:3000`

#### Oracle Cron Service

The oracle service runs independently to update prices:

```bash
# Development (with auto-reload)
npm run dev:cron

# Production (builds TypeScript, runs cron)
npm run build
npm run start:cron
```

See [ORACLE_README.md](./ORACLE_README.md) for detailed oracle documentation.

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Markets
- `GET /api/orbital/markets` - Get all markets
- `GET /api/orbital/markets/:id` - Get market by ID
- `POST /api/orbital/markets` - Create new market

**Create Market Example:**
```json
POST /api/orbital/markets
{
  "appId": 748146169,
  "baseTokenId": 744427912,
  "lstTokenId": 748153199
}
```

### User Records
- `POST /api/orbital/records` - Create new user record
- `GET /api/orbital/records/market/:marketId` - Get all records for a market
- `GET /api/orbital/records/:address/:marketId` - Get records for address and market
- `POST /api/orbital/records/:address/:marketId/stats` - Get user stats for market
- `GET /api/orbital/records/:address` - Get all records for an address

**Create User Record Example:**
```json
POST /api/orbital/records
{
  "address": "ALGORAND_ADDRESS",
  "marketId": 748146169,
  "action": "supply",
  "tokenInId": 744427912,
  "tokenOutId": 748153199,
  "tokensIn": 100.5,
  "tokensOut": 100.5,
  "timestamp": 1698012345,
  "txnId": "TXN_ID"
}
```

**Get User Stats Example:**
```json
POST /api/orbital/records/ALGORAND_ADDRESS/748146169/stats
{
  "baseTokenId": 744427912,
  "lstTokenId": 748153199,
  "acceptedCollateralTokenIds": [748153199, 748156049]
}

Response:
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

## Database Migrations

### Run pending migrations
```bash
npm run migrate:up
```

### Rollback last migration
```bash
npm run migrate:down
```

### Check migration status
```bash
npm run migrate:status
```

## Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

```bash
npm run dev
```

This starts the server with nodemon for auto-reload on file changes.

## Error Handling

All endpoints return consistent JSON responses:

**Success:**
```json
{
  "success": true,
  "data": {...}
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error"
}
```

## TypeScript Support

The backend is now **fully written in TypeScript**, providing end-to-end type safety across the entire application.

### File Organization

- **TypeScript Files**: All files in `src/` (app, server, routes, controllers, services, models, utils, middleware, config)
- **JavaScript Files**: Only `src/migrations/**/*.js` (database migrations, kept as JS for compatibility)

### Build Process

```bash
# Build TypeScript to JavaScript
npm run build

# Output goes to dist/ directory
```

### Development with TypeScript

Use `tsx` for development (no build step needed):

```bash
npm run dev:cron  # Runs TypeScript directly with hot reload
```

For full details, see [TYPESCRIPT_MIGRATION.md](./TYPESCRIPT_MIGRATION.md)

## Security Features

- **Helmet** - Secure HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Prevent abuse (100 requests per 15 minutes)
- **SSL/TLS** - Encrypted database connections

## Testing the API

```bash
# Health check
curl http://localhost:3000/api/health

# Get markets
curl http://localhost:3000/api/orbital/markets

# Create market
curl -X POST http://localhost:3000/api/orbital/markets \
  -H "Content-Type: application/json" \
  -d '{"appId":748146169,"baseTokenId":744427912,"lstTokenId":748153199}'

# Get user records
curl http://localhost:3000/api/orbital/records/ALGORAND_ADDRESS
```

## License

MIT
