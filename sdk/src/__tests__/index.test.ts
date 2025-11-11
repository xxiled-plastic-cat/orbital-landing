import { describe, it, expect } from 'vitest';
import * as SDK from '../index';

describe('SDK exports', () => {
  it('should export OrbitalSDK class', () => {
    expect(SDK.OrbitalSDK).toBeDefined();
    expect(typeof SDK.OrbitalSDK).toBe('function');
  });

  it('should export calculation utilities', () => {
    expect(SDK.utilNormBps).toBeDefined();
    expect(SDK.aprBpsKinked).toBeDefined();
    expect(SDK.currentAprBps).toBeDefined();
    expect(SDK.calculateLSTDue).toBeDefined();
    expect(SDK.calculateAssetDue).toBeDefined();
    expect(SDK.calculateLSTPrice).toBeDefined();
    expect(SDK.microToStandard).toBeDefined();
    expect(SDK.standardToMicro).toBeDefined();
  });

  it('should export state utilities', () => {
    expect(SDK.getApplicationGlobalState).toBeDefined();
    expect(SDK.getBoxValue).toBeDefined();
    expect(SDK.decodeDepositRecord).toBeDefined();
    expect(SDK.decodeLoanRecord).toBeDefined();
    expect(SDK.createDepositBoxName).toBeDefined();
    expect(SDK.createLoanBoxName).toBeDefined();
  });

  it('calculation utilities should be functions', () => {
    expect(typeof SDK.utilNormBps).toBe('function');
    expect(typeof SDK.aprBpsKinked).toBe('function');
    expect(typeof SDK.currentAprBps).toBe('function');
    expect(typeof SDK.calculateLSTDue).toBe('function');
    expect(typeof SDK.calculateAssetDue).toBe('function');
    expect(typeof SDK.calculateLSTPrice).toBe('function');
    expect(typeof SDK.microToStandard).toBe('function');
    expect(typeof SDK.standardToMicro).toBe('function');
  });

  it('state utilities should be functions', () => {
    expect(typeof SDK.getApplicationGlobalState).toBe('function');
    expect(typeof SDK.getBoxValue).toBe('function');
    expect(typeof SDK.decodeDepositRecord).toBe('function');
    expect(typeof SDK.decodeLoanRecord).toBe('function');
    expect(typeof SDK.createDepositBoxName).toBe('function');
    expect(typeof SDK.createLoanBoxName).toBe('function');
  });
});

