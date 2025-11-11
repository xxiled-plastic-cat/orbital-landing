import { describe, it, expect, vi, beforeEach } from 'vitest';
import algosdk from 'algosdk';
import { OrbitalSDK } from '../client';

// Mock algosdk
vi.mock('algosdk', async () => {
  const actual = await vi.importActual('algosdk');
  return {
    ...actual,
    Algodv2: vi.fn(),
  };
});

describe('OrbitalSDK', () => {
  let sdk: OrbitalSDK;
  let mockAlgodClient: any;

  beforeEach(() => {
    // Create mock algod client
    mockAlgodClient = {
      getApplicationByID: vi.fn(),
      getApplicationBoxByName: vi.fn(),
      accountInformation: vi.fn(),
    };

    // Setup default mock responses
    mockAlgodClient.getApplicationByID.mockReturnValue({
      do: vi.fn().mockResolvedValue({
        params: {
          'global-state': [],
        },
      }),
    });

    sdk = new OrbitalSDK({
      algodClient: mockAlgodClient as any,
      network: 'testnet',
    });
  });

  describe('getAPY', () => {
    it('should calculate APY correctly', async () => {
      const globalState = [
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 1000000 } },
        { key: Buffer.from('total_borrows').toString('base64'), value: { type: 2, uint: 500000 } },
        { key: Buffer.from('base_bps').toString('base64'), value: { type: 2, uint: 200 } },
        { key: Buffer.from('util_cap_bps').toString('base64'), value: { type: 2, uint: 10000 } },
        { key: Buffer.from('kink_norm_bps').toString('base64'), value: { type: 2, uint: 5000 } },
        { key: Buffer.from('slope1_bps').toString('base64'), value: { type: 2, uint: 1000 } },
        { key: Buffer.from('slope2_bps').toString('base64'), value: { type: 2, uint: 4000 } },
        { key: Buffer.from('max_apr_bps').toString('base64'), value: { type: 2, uint: 60000 } },
        { key: Buffer.from('rate_model_type').toString('base64'), value: { type: 2, uint: 0 } },
        { key: Buffer.from('protocol_share_bps').toString('base64'), value: { type: 2, uint: 500 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getAPY(12345678);

      expect(result).toBeDefined();
      expect(result.supplyApy).toBeGreaterThanOrEqual(0);
      expect(result.borrowApy).toBeGreaterThanOrEqual(0);
      expect(result.utilizationRate).toBeGreaterThanOrEqual(0);
      expect(result.utilizationRate).toBeLessThanOrEqual(100);
    });

    it('should handle 0% utilization', async () => {
      const globalState = [
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 1000000 } },
        { key: Buffer.from('total_borrows').toString('base64'), value: { type: 2, uint: 0 } },
        { key: Buffer.from('base_bps').toString('base64'), value: { type: 2, uint: 200 } },
        { key: Buffer.from('util_cap_bps').toString('base64'), value: { type: 2, uint: 10000 } },
        { key: Buffer.from('kink_norm_bps').toString('base64'), value: { type: 2, uint: 5000 } },
        { key: Buffer.from('slope1_bps').toString('base64'), value: { type: 2, uint: 1000 } },
        { key: Buffer.from('slope2_bps').toString('base64'), value: { type: 2, uint: 4000 } },
        { key: Buffer.from('max_apr_bps').toString('base64'), value: { type: 2, uint: 60000 } },
        { key: Buffer.from('rate_model_type').toString('base64'), value: { type: 2, uint: 0 } },
        { key: Buffer.from('protocol_share_bps').toString('base64'), value: { type: 2, uint: 500 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getAPY(12345678);

      expect(result.utilizationRate).toBe(0);
      expect(result.supplyApy).toBe(0); // No supply APY with 0% utilization
      expect(result.borrowApy).toBe(2); // Base rate of 200 bps = 2%
    });

    it('should handle 100% utilization', async () => {
      const globalState = [
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 1000000 } },
        { key: Buffer.from('total_borrows').toString('base64'), value: { type: 2, uint: 1000000 } },
        { key: Buffer.from('base_bps').toString('base64'), value: { type: 2, uint: 200 } },
        { key: Buffer.from('util_cap_bps').toString('base64'), value: { type: 2, uint: 10000 } },
        { key: Buffer.from('kink_norm_bps').toString('base64'), value: { type: 2, uint: 5000 } },
        { key: Buffer.from('slope1_bps').toString('base64'), value: { type: 2, uint: 1000 } },
        { key: Buffer.from('slope2_bps').toString('base64'), value: { type: 2, uint: 4000 } },
        { key: Buffer.from('max_apr_bps').toString('base64'), value: { type: 2, uint: 60000 } },
        { key: Buffer.from('rate_model_type').toString('base64'), value: { type: 2, uint: 0 } },
        { key: Buffer.from('protocol_share_bps').toString('base64'), value: { type: 2, uint: 500 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getAPY(12345678);

      expect(result.utilizationRate).toBe(100);
      expect(result.borrowApy).toBeGreaterThan(2); // Should be higher than base rate
      expect(result.supplyApy).toBeGreaterThan(0);
    });
  });

  describe('getLSTPrice', () => {
    it('should calculate LST price correctly', async () => {
      const globalState = [
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 1200000 } },
        { key: Buffer.from('circulating_lst').toString('base64'), value: { type: 2, uint: 1000000 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getLSTPrice(12345678);

      expect(result.price).toBe(1.2);
      expect(result.exchangeRate).toBe(1.2);
      expect(result.totalDeposits).toBe(1200000n);
      expect(result.circulatingLST).toBe(1000000n);
    });

    it('should return 1.0 for initial state', async () => {
      const globalState = [
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 0 } },
        { key: Buffer.from('circulating_lst').toString('base64'), value: { type: 2, uint: 0 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getLSTPrice(12345678);

      expect(result.price).toBe(1.0);
    });

    it('should handle 1:1 ratio', async () => {
      const globalState = [
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 1000000 } },
        { key: Buffer.from('circulating_lst').toString('base64'), value: { type: 2, uint: 1000000 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getLSTPrice(12345678);

      expect(result.price).toBe(1.0);
    });
  });

  describe('getMarket', () => {
    it('should return formatted market data', async () => {
      const globalState = [
        { key: Buffer.from('base_token_id').toString('base64'), value: { type: 2, uint: 0 } },
        { key: Buffer.from('lst_token_id').toString('base64'), value: { type: 2, uint: 123456 } },
        { key: Buffer.from('oracle_app').toString('base64'), value: { type: 2, uint: 789012 } },
        { key: Buffer.from('buyout_token_id').toString('base64'), value: { type: 2, uint: 345678 } },
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 1000000000000 } },
        { key: Buffer.from('total_borrows').toString('base64'), value: { type: 2, uint: 500000000000 } },
        { key: Buffer.from('circulating_lst').toString('base64'), value: { type: 2, uint: 1000000000000 } },
        { key: Buffer.from('borrow_index_wad').toString('base64'), value: { type: 2, uint: 1000000000000000000 } },
        { key: Buffer.from('last_update').toString('base64'), value: { type: 2, uint: 1234567890 } },
        { key: Buffer.from('base_bps').toString('base64'), value: { type: 2, uint: 200 } },
        { key: Buffer.from('util_cap_bps').toString('base64'), value: { type: 2, uint: 10000 } },
        { key: Buffer.from('kink_norm_bps').toString('base64'), value: { type: 2, uint: 5000 } },
        { key: Buffer.from('slope1_bps').toString('base64'), value: { type: 2, uint: 1000 } },
        { key: Buffer.from('slope2_bps').toString('base64'), value: { type: 2, uint: 4000 } },
        { key: Buffer.from('max_apr_bps').toString('base64'), value: { type: 2, uint: 60000 } },
        { key: Buffer.from('rate_model_type').toString('base64'), value: { type: 2, uint: 0 } },
        { key: Buffer.from('protocol_share_bps').toString('base64'), value: { type: 2, uint: 500 } },
        { key: Buffer.from('origination_fee_bps').toString('base64'), value: { type: 2, uint: 100 } },
        { key: Buffer.from('liq_bonus_bps').toString('base64'), value: { type: 2, uint: 750 } },
        { key: Buffer.from('contract_state').toString('base64'), value: { type: 2, uint: 1 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getMarket(12345678);

      expect(result.appId).toBe(12345678);
      expect(result.baseTokenId).toBe(0);
      expect(result.lstTokenId).toBe(123456);
      expect(result.oracleAppId).toBe(789012);
      expect(result.buyoutTokenId).toBe(345678);
      expect(result.totalDeposits).toBeCloseTo(1000000, 1); // 1M ALGO
      expect(result.totalBorrows).toBeCloseTo(500000, 1); // 500k ALGO
      expect(result.supplyApy).toBeGreaterThanOrEqual(0);
      expect(result.borrowApy).toBeGreaterThanOrEqual(0);
      expect(result.utilizationRate).toBeCloseTo(50, 1);
      expect(result.contractState).toBe(1);
    });
  });

  describe('getNetwork', () => {
    it('should return the configured network', () => {
      expect(sdk.getNetwork()).toBe('testnet');
    });

    it('should return mainnet when configured', () => {
      const mainnetSdk = new OrbitalSDK({
        algodClient: mockAlgodClient as any,
        network: 'mainnet',
      });

      expect(mainnetSdk.getNetwork()).toBe('mainnet');
    });
  });

  describe('getGlobalState', () => {
    it('should return raw global state', async () => {
      const globalState = [
        { key: Buffer.from('total_deposits').toString('base64'), value: { type: 2, uint: 1000000 } },
        { key: Buffer.from('total_borrows').toString('base64'), value: { type: 2, uint: 500000 } },
      ];

      mockAlgodClient.getApplicationByID.mockReturnValue({
        do: vi.fn().mockResolvedValue({
          params: { 'global-state': globalState },
        }),
      });

      const result = await sdk.getGlobalState(12345678);

      expect(result.total_deposits).toBe(1000000n);
      expect(result.total_borrows).toBe(500000n);
    });
  });
});

