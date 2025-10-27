# Oracle Price Update Service

The Oracle Price Update Service is a standalone cron service that periodically fetches cryptocurrency prices from multiple sources and updates the Orbital lending protocol's oracle contracts on the Algorand blockchain.

## Architecture

The service is designed to run as a separate web service on Digital Ocean, independent of the main API server. This ensures that price updates continue reliably even if the API server is under maintenance.

### Components

1. **`src/cron.js`** - Main cron service entry point
2. **`src/services/oracleService.js`** - Core oracle logic and price fetching
3. **`src/utils/priceCalculations.js`** - Price calculation utilities (median, change detection)

## How It Works

### Price Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Cron Trigger (Every 2-3 minutes)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Retrieve Assets from Oracle Application                 │
│     - Asset IDs                                             │
│     - Current prices                                        │
│     - Asset metadata                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Fetch Prices from Multiple Sources                      │
│     ├─ CompX DEX                                            │
│     └─ Vestige DEX                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Calculate Median Price                                  │
│     - Filter valid prices                                   │
│     - Calculate median from sources                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Check Price Change Threshold                            │
│     - Calculate percentage change                           │
│     - Compare against 0.05% threshold                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Update Oracle Contract (if threshold exceeded)          │
│     - Create update transaction                             │
│     - Sign with oracle account                              │
│     - Submit to Algorand network                            │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

Configure the oracle service by setting these environment variables in your `.env` file:

```bash
# Cron schedule (cron format)
ORACLE_CRON_SCHEDULE=*/2 * * * *  # Every 2 minutes

# Price change threshold (percentage)
ORACLE_PRICE_THRESHOLD=0.05       # 0.05%

# Timezone for cron scheduling
ORACLE_TIMEZONE=America/New_York

# Algorand network
ALGORAND_NETWORK=testnet

# Oracle application ID
ORACLE_APP_ID=123456789

# Oracle service account (for signing transactions)
ORACLE_ACCOUNT_MNEMONIC="your twenty five word mnemonic phrase here..."
```

### Cron Schedule Format

The cron schedule uses the standard cron format:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Examples:**
- `*/2 * * * *` - Every 2 minutes
- `*/3 * * * *` - Every 3 minutes
- `0,15,30,45 * * * *` - Every 15 minutes
- `0 */1 * * *` - Every hour
- `0 0 * * *` - Daily at midnight

## Running the Service

### Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev:cron
```

### Production

```bash
# Install dependencies
npm install --production

# Run the cron service
npm run start:cron
```

### Digital Ocean Deployment

The cron service is designed to run as a separate app on Digital Ocean:

1. Create a new App in Digital Ocean App Platform
2. Connect your repository
3. Set the **Build Command**: `npm install --production`
4. Set the **Run Command**: `npm run start:cron`
5. Configure environment variables in the App settings
6. Deploy the app

The service will start automatically and run according to the configured schedule.

## Implementation Status

### ✅ Complete

- [x] Cron service foundation and scheduling
- [x] Price calculation utilities (median, change detection)
- [x] Service architecture and flow
- [x] Configuration management
- [x] Logging and error handling
- [x] Graceful shutdown handling

### 🚧 To Be Implemented

The following functions are **stubbed** and need actual implementation:

#### 1. `getOracleAssets()` in `oracleService.js`

**Purpose:** Read asset information from the Algorand oracle application

**TODO:**
- Connect to Algorand node
- Read oracle application global state
- Parse asset IDs and current prices
- Return array of asset objects

#### 2. `fetchCompXPrice()` in `oracleService.js`

**Purpose:** Fetch price from CompX DEX

**TODO:**
- Implement CompX API integration
- Handle API authentication if needed
- Parse response format
- Return price or null if unavailable

#### 3. `fetchVestigePrice()` in `oracleService.js`

**Purpose:** Fetch price from Vestige DEX

**TODO:**
- Implement Vestige API integration
- Handle API authentication if needed
- Parse response format
- Return price or null if unavailable

#### 4. `updateOracleContract()` in `oracleService.js`

**Purpose:** Update oracle contract with new price

**TODO:**
- Create Algorand transaction
- Call oracle update method
- Sign with oracle service account
- Submit and wait for confirmation
- Handle transaction errors

## Testing

### Manual Testing

You can test the oracle update cycle manually:

```bash
# Start the cron service
npm run dev:cron

# The service will:
# 1. Run immediately on startup
# 2. Run on the configured schedule
# 3. Log detailed output for each update cycle
```

### Test Output

The service provides detailed logging for each update cycle:

```
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  🛰️  ORBITAL ORACLE PRICE UPDATE                                   ║
║                                                                    ║
║  Time: 2024-10-27T12:00:00.000Z                                   ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

🚀 Starting oracle price update cycle...
📊 Update threshold: 0.05%

📋 Fetching assets from oracle application...

✅ Found 3 assets to process

🔍 Processing ALGO (Asset ID: 1234567)
  Current oracle price: $0.250000
  🔍 Fetching ALGO price from CompX...
  🔍 Fetching ALGO price from Vestige...
  ⚠️  No valid prices found for ALGO

🔍 Processing USDCt (Asset ID: 2345678)
  Current oracle price: $1.000000
  🔍 Fetching USDCt price from CompX...
  🔍 Fetching USDCt price from Vestige...
  ⚠️  No valid prices found for USDCt

============================================================
📊 Oracle Update Summary
============================================================
Total Assets: 3
✅ Updated: 0
⏭️  Skipped: 0
❌ Failed: 3
⏱️  Duration: 623ms
============================================================
```

## Monitoring

### Health Checks

The cron service doesn't expose HTTP endpoints, but you can monitor its health by:

1. Checking the process is running
2. Monitoring log output
3. Verifying oracle contract updates on-chain

### Logging

The service logs:
- Startup configuration
- Each price update cycle
- Individual asset updates
- Errors and warnings
- Summary statistics

### Alerting

Consider setting up alerts for:
- Service crashes or restarts
- High failure rates
- Stale prices (no updates for extended period)
- Price sources becoming unavailable

## Security Considerations

1. **Oracle Account Mnemonic**
   - Store securely in environment variables
   - Never commit to version control
   - Use Digital Ocean's encrypted environment variables

2. **Network Access**
   - Ensure service can access Algorand node
   - Configure firewall rules for API access
   - Use HTTPS for all external API calls

3. **Error Handling**
   - Service continues running on errors
   - Individual failures don't stop the entire cycle
   - Detailed error logging for debugging

## Troubleshooting

### Service Won't Start

- Check environment variables are set
- Verify cron schedule format is valid
- Check for port conflicts (shouldn't be any for cron service)

### No Price Updates

- Verify oracle account has sufficient ALGO for transactions
- Check oracle application ID is correct
- Ensure price sources are accessible
- Review price change threshold (might be too high)

### High Error Rate

- Check external API availability (CompX, Vestige)
- Verify network connectivity
- Review Algorand node accessibility
- Check oracle account balance

## Future Enhancements

Potential improvements for the oracle service:

- [ ] Add more price sources (centralized exchanges, other DEXs)
- [ ] Implement weighted median (weight by liquidity/volume)
- [ ] Add price deviation alerts
- [ ] Implement circuit breakers for extreme price changes
- [ ] Add metrics endpoint for monitoring
- [ ] Implement price caching to reduce API calls
- [ ] Add support for multiple oracle contracts
- [ ] Implement backup oracle accounts for redundancy

## Related Documentation

- [Backend README](./README.md) - Main backend documentation
- [Migrations Guide](./MIGRATIONS.md) - Database migrations
- [Digital Ocean Setup](./DIGITAL_OCEAN_SETUP.md) - Deployment guide

