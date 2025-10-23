# Orbital Backend Migration Guide

This guide explains the migration from the general backend API to the dedicated Orbital backend.

## Overview

The Orbital project now has its own dedicated Node.js backend with PostgreSQL database (via Supabase), replacing the previous shared general backend API.

### What Changed

**Before:**
- Shared general backend at `/api/orbital/*`
- Limited to basic market and transaction recording
- Dependent on larger, slower shared infrastructure

**After:**
- Dedicated Orbital backend at `http://localhost:3000/api`
- Comprehensive REST API for markets, loans, deposits, and user stats
- Fast, lightweight, and specifically designed for Orbital
- PostgreSQL database for robust data storage

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp env.template .env
# Edit .env with your Supabase connection string
```

### 3. Run Migrations

```bash
npm run migrate:up
```

### 4. Start Backend

```bash
# Development
npm run dev

# Production
npm start
```

The backend will be available at `http://localhost:3000`

## Frontend Setup

### 1. Configure Environment

```bash
cd frontend
cp env.template .env
```

Edit `.env`:
```bash
# Network Configuration
VITE_NETWORK=testnet
VITE_NETWORK_TOKEN=your_token_here

# New Orbital Backend
VITE_ORBITAL_BACKEND_URL=http://localhost:3000/api

# Supabase (optional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Update Dependencies

The frontend already has the updated services. Just restart your dev server:

```bash
npm run dev
```

## API Changes

### New API Endpoints

All endpoints are available at `http://localhost:3000/api`

#### Markets
- `GET /markets` - Get all markets
- `GET /markets/:id` - Get specific market
- `GET /markets/stats` - Get market statistics
- `POST /markets` - Create new market
- `PUT /markets/:id` - Update market

#### Loans
- `GET /loans` - Get all loans (with pagination)
- `GET /loans/:id` - Get specific loan
- `GET /loans/user/:address` - Get user's loans
- `GET /loans/stats` - Get loan statistics
- `POST /loans` - Create new loan
- `PUT /loans/:id` - Update loan

#### Deposits
- `GET /deposits` - Get all deposits (with pagination)
- `GET /deposits/:id` - Get specific deposit
- `GET /deposits/user/:address` - Get user's deposits
- `GET /deposits/stats` - Get deposit statistics
- `POST /deposits` - Create new deposit
- `PUT /deposits/:id` - Update deposit

#### Users
- `GET /users` - Get all users (with pagination)
- `GET /users/:address` - Get user statistics
- `GET /users/:address/portfolio` - Get complete user portfolio
- `PUT /users/:address` - Update user statistics

#### Health Check
- `GET /health` - Check API status

### Migration Details

#### Market Fetching
**Before:**
```typescript
const response = await axios.get(`${GENERAL_BACKEND_URL}/orbital/markets`);
```

**After:**
```typescript
import { fetchMarketsFromBackend } from './services/orbitalApi';
const markets = await fetchMarketsFromBackend();
```

#### User Action Recording
**Before:**
```typescript
await axios.post(`${GENERAL_BACKEND_URL}/orbital/records`, action);
```

**After:**
```typescript
import { createLoan, createDeposit } from './services/orbitalApi';
// Automatically routes to appropriate endpoint based on action type
await recordUserAction(action);
```

## New Features

### 1. Comprehensive Data Tracking
- Full loan lifecycle tracking (active → repaid → liquidated)
- Deposit tracking with interest earned
- User portfolio aggregation
- Market statistics

### 2. Better Performance
- Dedicated resources
- Optimized queries with indexes
- Connection pooling
- Gzip compression

### 3. Type-Safe API Client
New `orbitalApi.ts` service provides type-safe access to all backend endpoints:

```typescript
import { 
  fetchMarketsFromBackend,
  fetchUserLoans,
  fetchUserDeposits,
  fetchUserPortfolio 
} from './services/orbitalApi';
```

### 4. Database Migrations
Schema changes are now managed through migrations:

```bash
npm run migrate:up      # Run pending migrations
npm run migrate:down    # Rollback last migration
npm run migrate:status  # Check migration status
```

## Backward Compatibility

The old `GENERAL_BACKEND_URL` constant is still available for backward compatibility, but it's marked as deprecated. All new code should use `ORBITAL_BACKEND_URL`.

## Testing

### Test Backend Connection

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Orbital API is running",
  "timestamp": "2024-10-23T..."
}
```

### Test Market Fetching

```bash
curl http://localhost:3000/api/markets
```

## Deployment

### Backend Deployment

1. Set production environment variables
2. Run migrations: `npm run migrate:up`
3. Start server: `npm start`

### Frontend Deployment

Update your hosting provider's environment variables:
- `VITE_ORBITAL_BACKEND_URL` - Your production backend URL
- Other environment variables as needed

## Troubleshooting

### Backend won't start
- Check database connection in `.env`
- Ensure migrations have run: `npm run migrate:status`
- Check port 3000 isn't in use

### Frontend can't connect to backend
- Verify `VITE_ORBITAL_BACKEND_URL` is set correctly
- Check CORS settings in backend `app.js`
- Ensure backend is running

### Data not persisting
- Verify database connection
- Check migration status
- Review backend logs for errors

## Support

For issues:
1. Check backend logs: `npm run dev` shows detailed logs
2. Check frontend console for API errors
3. Verify database connection: test with migration status
4. Review error responses from API endpoints

## Next Steps

1. **Seed Data**: Add initial market data to the database
2. **Monitoring**: Set up monitoring/logging for production
3. **Backups**: Configure automated database backups
4. **Analytics**: Add analytics endpoints for protocol metrics

## Notes

- **Testnet**: Currently falls back to direct on-chain queries if backend is unavailable
- **Mainnet**: Requires backend for full functionality
- **Asset Metadata**: `/assets` endpoint not yet implemented - consider adding or using Algorand indexer

