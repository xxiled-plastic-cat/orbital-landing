/**
 * Utility functions for APY and LST calculations
 */

/**
 * Calculate normalized utilization in basis points (0-10000)
 * @param totalDeposits Total deposits in the market
 * @param totalBorrows Total borrows in the market
 * @param utilCapBps Utilization cap in basis points
 * @returns Normalized utilization in basis points
 */
export function utilNormBps(
  totalDeposits: bigint,
  totalBorrows: bigint,
  utilCapBps: bigint
): bigint {
  if (totalDeposits === 0n) return 0n;
  
  // util_bps = (totalBorrows * 10000) / totalDeposits
  const utilBps = (totalBorrows * 10000n) / totalDeposits;
  
  // Clamp to utilCapBps
  if (utilBps > utilCapBps) return utilCapBps;
  
  // normalized = (utilBps * 10000) / utilCapBps
  return (utilBps * 10000n) / utilCapBps;
}

/**
 * Calculate APR using kinked interest rate model
 * @param U_norm_bps Normalized utilization in basis points
 * @param params Interest rate model parameters
 * @returns APR in basis points
 */
export function aprBpsKinked(
  U_norm_bps: bigint,
  params: {
    base_bps: bigint;
    kink_norm_bps: bigint;
    slope1_bps: bigint;
    slope2_bps: bigint;
    max_apr_bps: bigint;
  }
): bigint {
  let apr = params.base_bps;

  if (U_norm_bps <= params.kink_norm_bps) {
    // Below kink: APR = base + slope1 * U_norm
    // slope1 * U_norm = (slope1_bps * U_norm_bps) / 10000
    apr = apr + (params.slope1_bps * U_norm_bps) / 10000n;
  } else {
    // Above kink: APR = base + slope1 * kink + slope2 * (U_norm - kink)
    const aprAtKink = params.base_bps + (params.slope1_bps * params.kink_norm_bps) / 10000n;
    const excessUtil = U_norm_bps - params.kink_norm_bps;
    apr = aprAtKink + (params.slope2_bps * excessUtil) / 10000n;
  }

  // Clamp to max APR
  if (apr > params.max_apr_bps) {
    apr = params.max_apr_bps;
  }

  return apr;
}

/**
 * Calculate current APR for a market
 * @param state Market state parameters
 * @returns Object with APR in basis points and utilization
 */
export function currentAprBps(state: {
  totalDeposits: bigint;
  totalBorrows: bigint;
  base_bps: bigint;
  util_cap_bps: bigint;
  kink_norm_bps: bigint;
  slope1_bps: bigint;
  slope2_bps: bigint;
  max_apr_bps: bigint;
  rate_model_type: bigint;
}): { apr_bps: bigint; util_norm_bps: bigint } {
  const U_norm_bps = utilNormBps(
    state.totalDeposits,
    state.totalBorrows,
    state.util_cap_bps
  );

  let apr_bps: bigint;

  if (state.rate_model_type === 0n) {
    // Kinked model
    apr_bps = aprBpsKinked(U_norm_bps, {
      base_bps: state.base_bps,
      kink_norm_bps: state.kink_norm_bps,
      slope1_bps: state.slope1_bps,
      slope2_bps: state.slope2_bps,
      max_apr_bps: state.max_apr_bps,
    });
  } else {
    // Fixed rate fallback
    apr_bps = state.base_bps;
  }

  return { apr_bps, util_norm_bps: U_norm_bps };
}

/**
 * Calculate the amount of LST tokens due when making a deposit
 * @param amountIn The deposit amount in microunits
 * @param circulatingLST Total circulating LST tokens in microunits
 * @param totalDeposits Total deposits in the pool in microunits
 * @returns Amount of LST tokens to mint for the depositor in microunits
 */
export function calculateLSTDue(
  amountIn: bigint,
  circulatingLST: bigint,
  totalDeposits: bigint
): bigint {
  // If no deposits exist yet, return the deposit amount as initial LST supply (1:1 ratio)
  if (totalDeposits === 0n) {
    return amountIn;
  }

  // Calculate LST due using the formula: (amountIn * circulatingLST) / totalDeposits
  // This maintains the proportional share of the pool
  const lstDue = (amountIn * circulatingLST) / totalDeposits;

  return lstDue;
}

/**
 * Calculate the amount of underlying asset to return when redeeming LST tokens
 * @param lstAmount The amount of LST tokens being redeemed in microunits
 * @param circulatingLST Total circulating LST tokens in microunits
 * @param totalDeposits Total deposits in the pool in microunits
 * @returns Amount of underlying asset to return to the redeemer in microunits
 */
export function calculateAssetDue(
  lstAmount: bigint,
  circulatingLST: bigint,
  totalDeposits: bigint
): bigint {
  // If no LST tokens exist, return 0
  if (circulatingLST === 0n) {
    return 0n;
  }

  // Calculate asset due using the formula: (lstAmount * totalDeposits) / circulatingLST
  // This maintains the proportional share of the pool
  const assetDue = (lstAmount * totalDeposits) / circulatingLST;

  return assetDue;
}

/**
 * Calculate LST price (how much underlying asset 1 LST is worth)
 * @param circulatingLST Total circulating LST tokens
 * @param totalDeposits Total deposits in the pool
 * @returns Exchange rate (totalDeposits / circulatingLST)
 */
export function calculateLSTPrice(
  circulatingLST: bigint,
  totalDeposits: bigint
): number {
  if (circulatingLST === 0n) {
    return 1.0; // Initial price is 1:1
  }
  
  // Price = totalDeposits / circulatingLST
  // Convert to number with precision
  const price = Number(totalDeposits) / Number(circulatingLST);
  
  return price;
}

/**
 * Convert microunits to standard units with decimals
 * @param amount Amount in microunits (bigint)
 * @param decimals Number of decimals
 * @returns Amount in standard units (number)
 */
export function microToStandard(amount: bigint, decimals: number): number {
  return Number(amount) / Math.pow(10, decimals);
}

/**
 * Convert standard units to microunits
 * @param amount Amount in standard units (number)
 * @param decimals Number of decimals
 * @returns Amount in microunits (bigint)
 */
export function standardToMicro(amount: number, decimals: number): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

