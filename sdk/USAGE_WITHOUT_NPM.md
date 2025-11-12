# Using the Orbital SDK Without Publishing to NPM

This guide explains how to use the Orbital Lending SDK in your Node.js applications without publishing it to npm.

## Installation Methods

### Method 1: Install from Tarball (Recommended for Production)

The SDK is packaged as a tarball file that can be installed directly:

```bash
# Option A: Install from local path
npm install /path/to/orbital-landing/sdk/compx-orbital-lending-sdk-1.0.0.tgz

# Option B: Copy tarball to your project first
cp /path/to/orbital-landing/sdk/compx-orbital-lending-sdk-1.0.0.tgz ./packages/
npm install ./packages/compx-orbital-lending-sdk-1.0.0.tgz
```

**Advantages:**
- ✅ Works in production deployments (Digital Ocean, AWS, etc.)
- ✅ Version controlled - commit the tarball to your repo
- ✅ No external dependencies during deployment
- ✅ Deterministic builds
- ✅ No authentication required

**For Digital Ocean Deployment:**
1. Commit the tarball to your application's repository:
   ```bash
   mkdir -p packages
   cp compx-orbital-lending-sdk-1.0.0.tgz packages/
   git add packages/compx-orbital-lending-sdk-1.0.0.tgz
   git commit -m "Add Orbital SDK package"
   ```

2. Update your `package.json`:
   ```json
   {
     "dependencies": {
       "@compx/orbital-lending-sdk": "file:./packages/compx-orbital-lending-sdk-1.0.0.tgz"
     }
   }
   ```

3. Deploy normally - `npm install` will work on the server

### Method 2: Install from File Path (Development)

Link directly to the SDK directory for active development:

```json
{
  "dependencies": {
    "@compx/orbital-lending-sdk": "file:../orbital-landing/sdk"
  }
}
```

Then run `npm install`. Changes to the SDK will be reflected immediately.

**Advantages:**
- ✅ Perfect for local development
- ✅ Live updates when SDK changes
- ✅ No need to rebuild tarball

**Disadvantages:**
- ❌ Doesn't work for remote deployments
- ❌ Requires SDK source code on the machine

### Method 3: npm link (Development)

Create a global symlink for development:

```bash
# In the SDK directory
cd /path/to/orbital-landing/sdk
npm link

# In your application directory
cd /path/to/your-app
npm link @compx/orbital-lending-sdk
```

**Advantages:**
- ✅ Great for developing multiple apps using the SDK
- ✅ Changes immediately reflected

**Disadvantages:**
- ❌ Global state (can cause confusion)
- ❌ Doesn't work for deployments

### Method 4: GitHub Packages (Optional)

If your repository is on GitHub, you can use GitHub Packages as a free private npm registry:

1. Create a `.npmrc` file in the SDK directory:
   ```
   @compx:registry=https://npm.pkg.github.com
   ```

2. Publish to GitHub Packages:
   ```bash
   npm publish
   ```

3. In your app, create a `.npmrc`:
   ```
   @compx:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

4. Install normally:
   ```bash
   npm install @compx/orbital-lending-sdk
   ```

## Usage Example

Once installed using any method above, use the SDK normally:

```typescript
import { OrbitalSDK } from '@compx/orbital-lending-sdk';
import algosdk from 'algosdk';

// Initialize SDK
const algodClient = new algosdk.Algodv2(
  '',
  'https://mainnet-api.algonode.cloud',
  ''
);

const sdk = new OrbitalSDK({
  algodClient,
  network: 'mainnet',
});

// Use the new getAllUserPositions method
const userPositions = await sdk.getAllUserPositions('YOUR_ADDRESS_HERE');

console.log(`Active in ${userPositions.activeMarkets} markets`);
console.log(`Total Supplied: ${userPositions.totalSupplied}`);
console.log(`Total Borrowed: ${userPositions.totalBorrowed}`);
console.log(`Health Factor: ${userPositions.overallHealthFactor}`);
```

## Updating the SDK

When you make changes to the SDK:

### For Tarball Method:

```bash
cd /path/to/orbital-landing/sdk

# 1. Make your changes
# 2. Build the SDK
npm run build

# 3. Create new tarball
npm pack

# 4. Copy to your app (if needed)
cp compx-orbital-lending-sdk-1.0.0.tgz /path/to/your-app/packages/

# 5. Reinstall in your app
cd /path/to/your-app
npm install
```

### For File Path / npm link Method:

Just rebuild the SDK - changes are automatically reflected:

```bash
cd /path/to/orbital-landing/sdk
npm run build
```

## Troubleshooting

### "Cannot find module '@compx/orbital-lending-sdk'"

Make sure you've installed the package:
```bash
npm install ./path/to/compx-orbital-lending-sdk-1.0.0.tgz
```

### "Module not found" in TypeScript

Make sure your `tsconfig.json` includes `node_modules`:
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

### Changes not reflecting (file path method)

Rebuild the SDK:
```bash
cd /path/to/orbital-landing/sdk
npm run build
```

### Digital Ocean deployment failing

Make sure the tarball is committed to your repository and referenced correctly in `package.json`:
```json
{
  "dependencies": {
    "@compx/orbital-lending-sdk": "file:./packages/compx-orbital-lending-sdk-1.0.0.tgz"
  }
}
```

## New Features (v1.0.0)

### Get All User Positions

The SDK now includes methods to fetch all positions (deposits and borrows) for a user across all markets:

```typescript
// Get all positions across all markets
const allPositions = await sdk.getAllUserPositions(userAddress);

// Get positions for specific markets only
const specificPositions = await sdk.getUserPositionsForMarkets(
  userAddress,
  [marketId1, marketId2]
);
```

**Returns:**
- Individual positions for each market
- Aggregated totals (supplied, borrowed, collateral)
- Overall health factor
- Number of active markets

See `src/examples/user-positions.ts` for complete examples.

## Support

For issues or questions:
- Check the README.md for full API documentation
- Review examples in `src/examples/`
- Check TypeScript definitions for available types and methods

