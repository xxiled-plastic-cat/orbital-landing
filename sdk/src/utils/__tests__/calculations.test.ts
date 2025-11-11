import { describe, it, expect } from 'vitest';
import {
  utilNormBps,
  aprBpsKinked,
  currentAprBps,
  calculateLSTDue,
  calculateAssetDue,
  calculateLSTPrice,
  microToStandard,
  standardToMicro,
} from '../calculations';

describe('calculations', () => {
  describe('utilNormBps', () => {
    it('should return 0 when totalDeposits is 0', () => {
      const result = utilNormBps(0n, 1000n, 10000n);
      expect(result).toBe(0n);
    });

    it('should calculate normalized utilization correctly', () => {
      // 50% utilization: (5000 * 10000) / 10000 = 5000
      const result = utilNormBps(10000n, 5000n, 10000n);
      expect(result).toBe(5000n);
    });

    it('should cap at utilCapBps when utilization exceeds cap', () => {
      // 100% utilization with 80% cap
      const result = utilNormBps(10000n, 10000n, 8000n);
      expect(result).toBe(8000n);
    });

    it('should normalize correctly with cap', () => {
      // 40% utilization with 80% cap: (4000 * 10000) / 8000 = 5000 (normalized to 50%)
      const result = utilNormBps(10000n, 4000n, 8000n);
      expect(result).toBe(5000n);
    });
  });

  describe('aprBpsKinked', () => {
    const defaultParams = {
      base_bps: 200n, // 2%
      kink_norm_bps: 5000n, // 50%
      slope1_bps: 1000n, // 10%
      slope2_bps: 4000n, // 40%
      max_apr_bps: 60000n, // 600%
    };

    it('should calculate APR below kink', () => {
      // 30% utilization, below 50% kink
      // APR = 200 + (1000 * 3000) / 10000 = 200 + 300 = 500 (5%)
      const result = aprBpsKinked(3000n, defaultParams);
      expect(result).toBe(500n);
    });

    it('should calculate APR at kink', () => {
      // 50% utilization, at kink
      // APR = 200 + (1000 * 5000) / 10000 = 200 + 500 = 700 (7%)
      const result = aprBpsKinked(5000n, defaultParams);
      expect(result).toBe(700n);
    });

    it('should calculate APR above kink', () => {
      // 80% utilization, above 50% kink
      // APR at kink = 700
      // Excess = 8000 - 5000 = 3000
      // APR = 700 + (4000 * 3000) / 10000 = 700 + 1200 = 1900 (19%)
      const result = aprBpsKinked(8000n, defaultParams);
      expect(result).toBe(1900n);
    });

    it('should cap at max APR', () => {
      // Very high utilization that would exceed max
      const result = aprBpsKinked(10000n, defaultParams);
      expect(result).toBeLessThanOrEqual(defaultParams.max_apr_bps);
    });

    it('should return base APR at 0% utilization', () => {
      const result = aprBpsKinked(0n, defaultParams);
      expect(result).toBe(defaultParams.base_bps);
    });
  });

  describe('currentAprBps', () => {
    const defaultState = {
      totalDeposits: 1000000n,
      totalBorrows: 500000n,
      base_bps: 200n,
      util_cap_bps: 10000n,
      kink_norm_bps: 5000n,
      slope1_bps: 1000n,
      slope2_bps: 4000n,
      max_apr_bps: 60000n,
      rate_model_type: 0n, // Kinked model
    };

    it('should calculate APR using kinked model', () => {
      const result = currentAprBps(defaultState);
      expect(result.apr_bps).toBeGreaterThan(0n);
      expect(result.util_norm_bps).toBe(5000n); // 50% utilization
    });

    it('should use fixed rate for non-kinked model', () => {
      const state = { ...defaultState, rate_model_type: 1n };
      const result = currentAprBps(state);
      expect(result.apr_bps).toBe(defaultState.base_bps);
    });

    it('should handle 0% utilization', () => {
      const state = { ...defaultState, totalBorrows: 0n };
      const result = currentAprBps(state);
      expect(result.apr_bps).toBe(defaultState.base_bps);
      expect(result.util_norm_bps).toBe(0n);
    });

    it('should handle 100% utilization', () => {
      const state = { ...defaultState, totalBorrows: defaultState.totalDeposits };
      const result = currentAprBps(state);
      expect(result.apr_bps).toBeGreaterThan(defaultState.base_bps);
      expect(result.util_norm_bps).toBe(10000n);
    });
  });

  describe('calculateLSTDue', () => {
    it('should return 1:1 ratio for initial deposit', () => {
      const result = calculateLSTDue(1000000n, 0n, 0n);
      expect(result).toBe(1000000n);
    });

    it('should calculate LST proportionally', () => {
      // Pool has 1M deposits and 1M LST tokens
      // User deposits 100k, should get 100k LST
      const result = calculateLSTDue(100000n, 1000000n, 1000000n);
      expect(result).toBe(100000n);
    });

    it('should handle appreciation (LST worth more)', () => {
      // Pool has 1.2M deposits and 1M LST tokens (LST appreciated 20%)
      // User deposits 120k, should get 100k LST
      const result = calculateLSTDue(120000n, 1000000n, 1200000n);
      expect(result).toBe(100000n);
    });

    it('should handle small amounts', () => {
      const result = calculateLSTDue(1n, 1000000n, 1000000n);
      expect(result).toBe(1n);
    });
  });

  describe('calculateAssetDue', () => {
    it('should return 0 when no LST exists', () => {
      const result = calculateAssetDue(1000000n, 0n, 1000000n);
      expect(result).toBe(0n);
    });

    it('should calculate asset proportionally', () => {
      // Pool has 1M deposits and 1M LST tokens
      // User redeems 100k LST, should get 100k assets
      const result = calculateAssetDue(100000n, 1000000n, 1000000n);
      expect(result).toBe(100000n);
    });

    it('should handle appreciation (LST worth more)', () => {
      // Pool has 1.2M deposits and 1M LST tokens (LST appreciated 20%)
      // User redeems 100k LST, should get 120k assets
      const result = calculateAssetDue(100000n, 1000000n, 1200000n);
      expect(result).toBe(120000n);
    });

    it('should handle small rounding differences', () => {
      // Test case that would cause rounding: 83333 * 1200000 / 1000000 = 99999.6
      const result = calculateAssetDue(83333n, 1000000n, 1200000n);
      expect(result).toBe(99999n); // Expect the rounded-down value
    });

    it('should be inverse of calculateLSTDue with acceptable rounding', () => {
      const deposit = 100000n;
      const circulatingLST = 1000000n;
      const totalDeposits = 1200000n;

      const lstDue = calculateLSTDue(deposit, circulatingLST, totalDeposits);
      const assetDue = calculateAssetDue(lstDue, circulatingLST, totalDeposits);

      // Due to integer division, we may lose 1-2 units in the round trip
      // This is expected behavior and acceptable for financial applications
      const difference = deposit > assetDue ? deposit - assetDue : assetDue - deposit;
      expect(difference).toBeLessThanOrEqual(2n);
      expect(assetDue).toBeGreaterThan(0n);
    });
  });

  describe('calculateLSTPrice', () => {
    it('should return 1.0 for initial state', () => {
      const result = calculateLSTPrice(0n, 0n);
      expect(result).toBe(1.0);
    });

    it('should return 1.0 when LST equals deposits', () => {
      const result = calculateLSTPrice(1000000n, 1000000n);
      expect(result).toBe(1.0);
    });

    it('should calculate appreciation correctly', () => {
      // 1.2M deposits, 1M LST = 1.2 price
      const result = calculateLSTPrice(1000000n, 1200000n);
      expect(result).toBe(1.2);
    });

    it('should handle high precision', () => {
      // 1.23456789 price
      const result = calculateLSTPrice(1000000n, 1234567n);
      expect(result).toBeCloseTo(1.234567, 5);
    });
  });

  describe('microToStandard', () => {
    it('should convert ALGO microunits (6 decimals)', () => {
      const result = microToStandard(1000000n, 6);
      expect(result).toBe(1.0);
    });

    it('should convert BTC microunits (8 decimals)', () => {
      const result = microToStandard(100000000n, 8);
      expect(result).toBe(1.0);
    });

    it('should handle fractional amounts', () => {
      const result = microToStandard(1234567n, 6);
      expect(result).toBeCloseTo(1.234567, 6);
    });

    it('should handle zero', () => {
      const result = microToStandard(0n, 6);
      expect(result).toBe(0);
    });

    it('should handle large amounts', () => {
      const result = microToStandard(1000000000000n, 6);
      expect(result).toBe(1000000);
    });
  });

  describe('standardToMicro', () => {
    it('should convert ALGO standard units (6 decimals)', () => {
      const result = standardToMicro(1.0, 6);
      expect(result).toBe(1000000n);
    });

    it('should convert BTC standard units (8 decimals)', () => {
      const result = standardToMicro(1.0, 8);
      expect(result).toBe(100000000n);
    });

    it('should handle fractional amounts', () => {
      const result = standardToMicro(1.234567, 6);
      expect(result).toBe(1234567n);
    });

    it('should handle zero', () => {
      const result = standardToMicro(0, 6);
      expect(result).toBe(0n);
    });

    it('should floor fractional microunits', () => {
      // 1.2345678 with 6 decimals = 1234567 (floored)
      const result = standardToMicro(1.2345678, 6);
      expect(result).toBe(1234567n);
    });

    it('should be inverse of microToStandard', () => {
      const original = 1234567n;
      const standard = microToStandard(original, 6);
      const back = standardToMicro(standard, 6);
      expect(back).toBe(original);
    });
  });
});

