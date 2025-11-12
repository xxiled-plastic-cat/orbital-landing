# Changelog

All notable changes to the Orbital Finance SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-12

### Added
- **USD Value Calculation** - `getAllUserPositions()` and `getUserPositionsForMarkets()` now calculate and return `totalValueUSD` - the total USD value of all positions (supplied + borrowed + collateral)
  - Automatically fetches oracle prices for each market's base token
  - Handles multiple markets with different base tokens efficiently

### Fixed
- **API Route Prefix** - Fixed missing `/api` prefix in market list endpoint
- **Better Error Messages** - Errors now include the actual error details instead of generic messages
- **Improved Logging** - Added detailed logging throughout position fetching to aid debugging
  - Changed `console.debug` to `console.warn` for market-level failures
  - Added `[methodName]` prefixes to all logs for easier tracing
  - Added logging for deposit amounts and price fetching

## [1.0.0] - 2025-11-12

### Added
- **New Method: `getAllUserPositions(userAddress)`** - Fetch all positions (deposits and borrows) for a user across all active markets
  - Automatically checks deposit records and loan records across all markets
  - Returns aggregated totals for supplied, borrowed, and collateral amounts
  - Calculates overall health factor across all positions
  - Includes array of individual market positions
- **New Method: `getUserPositionsForMarkets(userAddress, marketAppIds)`** - Fetch user positions for specific markets only
  - Similar to `getAllUserPositions()` but with explicit market filtering
  - Useful for monitoring specific markets or reducing API calls
- **New Type: `UserAllPositions`** - Comprehensive type for aggregated user positions
  - Contains position arrays, totals, health factors, and active market count
- **Usage Documentation: `USAGE_WITHOUT_NPM.md`** - Guide for using the SDK without publishing to npm
  - Installation methods (tarball, file path, npm link)
  - Digital Ocean deployment instructions
  - Troubleshooting guide
- **Example: `user-positions.ts`** - Complete examples showing how to use the new position methods
  - Basic usage examples
  - Position monitoring and risk analysis examples

### Enhanced
- Updated README with comprehensive documentation for new methods
- Expanded API reference with detailed examples
- Improved type exports for better TypeScript IntelliSense

## [0.1.0] - 2024-11-11

### Added
- Initial release of Orbital Finance SDK
- Core `OrbitalSDK` client with methods:
  - `getMarket()` - Fetch comprehensive market data
  - `getAPY()` - Calculate supply and borrow APYs
  - `getLSTPrice()` - Get LST token pricing
  - `getUserPosition()` - Query user positions
  - `getGlobalState()` - Access raw contract state
- Calculation utilities:
  - Interest rate model calculations (kinked APR)
  - LST pricing and exchange rate calculations
  - Deposit/redemption calculations
  - Unit conversion helpers
- State management utilities:
  - Global state fetching and parsing
  - Box storage access
  - Deposit and loan record encoding/decoding
- Comprehensive type definitions for all data structures
- Full TypeScript support with type declarations
- Vitest test suite with 95%+ coverage
- Documentation and usage examples
- GitHub Actions CI/CD workflow

### Documentation
- README with quick start guide
- API reference documentation
- Testing guide (TESTING.md)
- Usage examples

[0.1.0]: https://github.com/orbital-finance/sdk/releases/tag/v0.1.0

