import { LendingMarket } from "../types/lending";

/**
 * Calculate the real-time borrow APR for a market using its interest rate model
 * @param market - The lending market object
 * @returns The calculated APR as a percentage
 */
export const calculateRealTimeBorrowAPR = (market: LendingMarket): number => {
  // Extract interest rate model parameters with defaults
  const baseBps = market.baseBps ?? 200; // 2% default
  const utilCapBps = market.utilCapBps ?? 8000; // 80% default
  const kinkNormBps = market.kinkNormBps ?? 5000; // 50% default
  const slope1Bps = market.slope1Bps ?? 1000; // 10% default
  const slope2Bps = market.slope2Bps ?? 4000; // 40% default
  const maxAprBps = market.maxAprBps ?? 60000; // 600% default
  const rateModelType = market.rateModelType ?? 0; // Kinked model default

  // Calculate interest rate at current utilization
  const utilization = market.utilizationRate;
  const utilizationBps = Math.min(utilization * 100, utilCapBps);
  const normalizedUtil = (utilizationBps / utilCapBps) * 10000;
  
  let aprBps: number;
  
  if (rateModelType === 0) { // Kinked model
    if (normalizedUtil <= kinkNormBps) {
      // Before kink: base + slope1 * (util / kink)
      aprBps = baseBps + (slope1Bps * normalizedUtil) / kinkNormBps;
    } else {
      // After kink: base + slope1 + slope2 * ((util - kink) / (10000 - kink))
      const over = normalizedUtil - kinkNormBps;
      const denom = 10000 - kinkNormBps;
      aprBps = baseBps + slope1Bps + (slope2Bps * over) / denom;
    }
    
    // Apply max APR cap if set
    if (maxAprBps > 0 && aprBps > maxAprBps) {
      aprBps = maxAprBps;
    }
  } else {
    // Fixed rate fallback
    aprBps = baseBps;
  }
  
  return aprBps / 100; // Convert basis points to percentage
};
