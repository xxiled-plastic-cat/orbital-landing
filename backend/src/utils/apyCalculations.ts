/**
 * Utility functions for calculating APY/APR for lending markets
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
  let apr: bigint;

  if (U_norm_bps <= params.kink_norm_bps) {
    // Before kink: base + slope1 * (U / kink)
    apr = params.base_bps + (params.slope1_bps * U_norm_bps) / params.kink_norm_bps;
  } else {
    // After kink: base + slope1 + slope2 * ((U - kink) / (10000 - kink))
    const over = U_norm_bps - params.kink_norm_bps;
    const denom = 10000n - params.kink_norm_bps;
    apr = params.base_bps + params.slope1_bps + (params.slope2_bps * over) / denom;
  }

  // Apply max APR cap
  if (params.max_apr_bps > 0n && apr > params.max_apr_bps) {
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

