import { describe, it, expect } from 'vitest';
import algosdk from 'algosdk';
import {
  decodeOraclePrice,
  createOraclePriceBoxName,
} from '../state';

describe('oracle utilities', () => {
  describe('decodeOraclePrice', () => {
    it('should decode oracle price correctly', () => {
      const oraclePriceType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64), // assetId
        new algosdk.ABIUintType(64), // price
        new algosdk.ABIUintType(64), // lastUpdated
      ]);

      const assetId = 31566704n;
      const price = 1234567n; // $1.234567
      const lastUpdated = 1699564800n; // Timestamp
      const encoded = oraclePriceType.encode([assetId, price, lastUpdated]);

      const result = decodeOraclePrice(encoded);

      expect(result.assetId).toBe(assetId);
      expect(result.price).toBe(price);
      expect(result.lastUpdated).toBe(lastUpdated);
    });

    it('should handle zero values', () => {
      const oraclePriceType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
      ]);

      const encoded = oraclePriceType.encode([0n, 0n, 0n]);
      const result = decodeOraclePrice(encoded);

      expect(result.assetId).toBe(0n);
      expect(result.price).toBe(0n);
      expect(result.lastUpdated).toBe(0n);
    });

    it('should handle large price values', () => {
      const oraclePriceType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
      ]);

      const largePrice = 999999999999n; // Very high price
      const encoded = oraclePriceType.encode([123n, largePrice, 1234567890n]);
      const result = decodeOraclePrice(encoded);

      expect(result.price).toBe(largePrice);
    });
  });

  describe('createOraclePriceBoxName', () => {
    it('should create oracle price box name with correct format', () => {
      const assetId = 31566704;

      const boxName = createOraclePriceBoxName(assetId);

      // Should start with 'prices' prefix
      const prefix = new TextEncoder().encode('prices');
      const prefixMatches = boxName.slice(0, prefix.length).every(
        (byte, i) => byte === prefix[i]
      );

      expect(prefixMatches).toBe(true);
      // Prefix (6 bytes) + assetId (8 bytes) = 14 bytes
      expect(boxName.length).toBe(prefix.length + 8);
    });

    it('should create different box names for different assets', () => {
      const boxName1 = createOraclePriceBoxName(0);
      const boxName2 = createOraclePriceBoxName(31566704);

      expect(boxName1).not.toEqual(boxName2);
    });

    it('should create same box name for same asset', () => {
      const boxName1 = createOraclePriceBoxName(123456);
      const boxName2 = createOraclePriceBoxName(123456);

      expect(boxName1).toEqual(boxName2);
    });

    it('should encode assetId as big-endian uint64', () => {
      const assetId = 256; // 0x0100
      const boxName = createOraclePriceBoxName(assetId);

      const prefix = new TextEncoder().encode('prices');
      // The uint64 encoding should be big-endian
      // 256 = 0x0000000000000100 in big-endian
      const assetIdBytes = boxName.slice(prefix.length);
      
      expect(assetIdBytes[6]).toBe(1); // Second-to-last byte
      expect(assetIdBytes[7]).toBe(0); // Last byte
      expect(assetIdBytes[0]).toBe(0); // First byte
    });
  });
});

