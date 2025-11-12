# Debugging the SDK

This guide explains how to debug the Orbital SDK interactively using VS Code's debugger.

## Setup

1. **Install dependencies** (if you haven't already):
   ```bash
   cd sdk
   pnpm install
   ```

2. **Install tsx** (TypeScript executor):
   ```bash
   pnpm install -D tsx
   ```
   (This should be done automatically when you run `pnpm install`)

## Debugging Methods

### Method 1: VS Code Debugger (Recommended)

1. **Open the debug script**: `sdk/src/debug.ts`

2. **Set breakpoints**:
   - Click in the gutter next to line numbers in `debug.ts` or `client.ts`
   - Red dots will appear indicating breakpoints

3. **Start debugging**:
   - Press `F5` or go to Run and Debug panel (Cmd+Shift+D / Ctrl+Shift+D)
   - Select "Debug SDK" from the dropdown
   - Click the green play button or press `F5`

4. **Debug controls**:
   - **Continue** (F5): Resume execution
   - **Step Over** (F10): Execute current line
   - **Step Into** (F11): Step into function calls
   - **Step Out** (Shift+F11): Step out of current function
   - **Restart** (Cmd+Shift+F5 / Ctrl+Shift+F5): Restart debugging
   - **Stop** (Shift+F5): Stop debugging

### Method 2: Debug Current File

If you want to debug any TypeScript file in the SDK:

1. Open the file you want to debug
2. Select "Debug SDK (Current File)" from the debug dropdown
3. Set breakpoints and start debugging

### Method 3: Command Line with Inspector

You can also run the debug script from the command line and attach VS Code:

1. **Terminal 1** - Start with inspector:
   ```bash
   cd sdk
   pnpm run debug --inspect
   ```

2. **VS Code** - Attach debugger:
   - Select "Debug SDK (Attach)" from debug dropdown
   - Click play

### Method 4: Direct Command Line

Run the debug script directly:
```bash
cd sdk
pnpm run debug
```

This won't allow stepping, but useful for quick testing.

## CLI Arguments

The debug script supports command-line arguments:

```bash
# Basic usage (runs all methods)
pnpm run debug

# With user address (runs all methods including user positions)
pnpm run debug -- --user ABC123...

# Specific method
pnpm run debug -- --user ABC123... --method getUserPosition
pnpm run debug -- --user ABC123... --method getAllUserPositions

# Different network
pnpm run debug -- --user ABC123... --network testnet

# Combine options
pnpm run debug -- --user ABC123... --network testnet --method getAllUserPositions
```

### Available Arguments

- `--user <address>`: Algorand user address (required for user position methods)
- `--network <mainnet|testnet>`: Network to use (default: mainnet)
- `--method <method>`: Run specific method only (see available methods below)

### Available Methods

- `getMarket` / `market`: Get market data
- `getAPY` / `apy`: Get APY information
- `getLSTPrice` / `lstprice`: Get LST token price
- `getUserPosition` / `userposition`: Get user position in a market (requires `--user`)
- `getAllUserPositions` / `alluserpositions` / `allpositions`: Get all user positions (requires `--user`)
- `getMarketList` / `marketlist`: Get list of markets
- `getAllMarkets` / `allmarkets`: Get all markets with full data

## Customizing the Debug Script

Edit `sdk/src/debug.ts` to:
- Change network (mainnet/testnet)
- Add/remove SDK method calls
- Test specific scenarios
- Add your own test code

## Tips

1. **Source Maps**: Source maps are enabled, so you can debug TypeScript directly without compiled JavaScript
2. **Breakpoints**: Set breakpoints in both `debug.ts` and `client.ts` to step through SDK internals
3. **Watch Variables**: Use the Watch panel to monitor variable values
4. **Call Stack**: Use the Call Stack panel to see the execution path
5. **Debug Console**: Use the Debug Console to evaluate expressions during debugging

## Example: Debugging User Position Methods

### Debugging getUserPosition()

1. Set breakpoints:
   - In `debug.ts` at line 315: `const position = await sdk.getUserPosition(...)`
   - In `client.ts` at line 259: `async getUserPosition(...)`
   - In `client.ts` at line 273: `let depositAmount = 0n;` (deposit fetching)
   - In `client.ts` at line 309: `let borrowed = 0n;` (loan fetching)

2. Run with user address:
   ```bash
   pnpm run debug -- --user YOUR_ADDRESS --method getUserPosition
   ```
   Or use VS Code: Select "Debug SDK (with User)" and enter your address when prompted.

3. Step through:
   - F11 to step into `getUserPosition`
   - Watch variables: `depositAmount`, `lstBalance`, `borrowed`, `collateral`
   - Step through deposit box fetching, LST balance fetching, and loan record fetching

### Debugging getAllUserPositions()

1. Set breakpoints:
   - In `debug.ts` at line 332: `const allPositions = await sdk.getAllUserPositions(...)`
   - In `client.ts` at line 763: `async getAllUserPositions(...)`
   - In `client.ts` at line 773: `const positionPromises = marketList.map(...)` (parallel fetching)
   - In `client.ts` at line 830: `const price = await this.getOraclePrice(...)` (price fetching)

2. Run with user address:
   ```bash
   pnpm run debug -- --user YOUR_ADDRESS --method getAllUserPositions
   ```

3. Step through:
   - Watch how it fetches positions for all markets in parallel
   - See how it aggregates totals
   - Observe price fetching for USD calculations
   - Check how health factors are calculated across positions

### Example: Debugging Any Method

1. Open `sdk/src/debug.ts` or use CLI with `--method`
2. Set breakpoints at the method call and inside `client.ts` at the method implementation
3. Start debugging and step through the code

Example - debugging `getMarket`:
```typescript
// Set breakpoint here in debug.ts
const marketData = await sdk.getMarket(marketAppId);

// Set breakpoint in client.ts at line 53: async getMarket(...)
// Step through to see how global state is fetched and processed
```

## Troubleshooting

**Breakpoints not hitting?**
- Make sure you're using "Debug SDK" configuration (not running via terminal)
- Check that source maps are enabled (they should be)
- Try restarting the debugger

**Can't see TypeScript source?**
- Ensure `tsconfig.json` has `"sourceMap": true` (it does)
- Check that the file is in the `src/` directory

**Module not found errors?**
- Run `pnpm install` to ensure all dependencies are installed
- Make sure you're in the `sdk/` directory

