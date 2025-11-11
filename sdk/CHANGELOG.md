# Changelog

All notable changes to the Orbital Finance SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

