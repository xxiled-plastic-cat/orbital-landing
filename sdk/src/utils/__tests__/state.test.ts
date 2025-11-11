import { describe, it, expect, beforeAll } from 'vitest';
import algosdk from 'algosdk';
import {
  decodeDepositRecord,
  decodeLoanRecord,
  createDepositBoxName,
  createLoanBoxName,
} from '../state';

// Generate valid test addresses
let testAddress1: string;
let testAddress2: string;

beforeAll(() => {
  // Generate valid Algorand addresses for testing
  const account1 = algosdk.generateAccount();
  const account2 = algosdk.generateAccount();
  testAddress1 = account1.addr;
  testAddress2 = account2.addr;
});

describe('state utilities', () => {
  describe('decodeDepositRecord', () => {
    it('should decode deposit record correctly', () => {
      const depositRecordType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64), // assetId
        new algosdk.ABIUintType(64), // depositAmount
      ]);

      const assetId = 31566704n;
      const depositAmount = 1000000n;
      const encoded = depositRecordType.encode([assetId, depositAmount]);

      const result = decodeDepositRecord(encoded);

      expect(result.assetId).toBe(assetId);
      expect(result.depositAmount).toBe(depositAmount);
    });

    it('should handle zero values', () => {
      const depositRecordType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
      ]);

      const encoded = depositRecordType.encode([0n, 0n]);
      const result = decodeDepositRecord(encoded);

      expect(result.assetId).toBe(0n);
      expect(result.depositAmount).toBe(0n);
    });

    it('should handle large values', () => {
      const depositRecordType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
      ]);

      const largeAmount = 18446744073709551615n; // Max uint64
      const encoded = depositRecordType.encode([0n, largeAmount]);
      const result = decodeDepositRecord(encoded);

      expect(result.depositAmount).toBe(largeAmount);
    });
  });

  describe('decodeLoanRecord', () => {
    it('should decode loan record correctly', () => {
      const loanRecordType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64), // collateralTokenId
        new algosdk.ABIUintType(64), // collateralAmount
        new algosdk.ABIUintType(64), // lastDebtChange
        new algosdk.ABIUintType(64), // borrowedTokenId
        new algosdk.ABIUintType(64), // principal
        new algosdk.ABIUintType(128), // userIndexWad
      ]);

      const collateralTokenId = 31566704n;
      const collateralAmount = 1000000n;
      const lastDebtChange = 1234567890n;
      const borrowedTokenId = 0n;
      const principal = 500000n;
      const userIndexWad = 1000000000000000000n; // 1e18

      const encoded = loanRecordType.encode([
        collateralTokenId,
        collateralAmount,
        lastDebtChange,
        borrowedTokenId,
        principal,
        userIndexWad,
      ]);

      const result = decodeLoanRecord(encoded);

      expect(result.collateralTokenId).toBe(collateralTokenId);
      expect(result.collateralAmount).toBe(collateralAmount);
      expect(result.lastDebtChange).toBe(lastDebtChange);
      expect(result.borrowedTokenId).toBe(borrowedTokenId);
      expect(result.principal).toBe(principal);
      expect(result.userIndexWad).toBe(userIndexWad);
    });

    it('should handle zero principal', () => {
      const loanRecordType = new algosdk.ABITupleType([
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(64),
        new algosdk.ABIUintType(128),
      ]);

      const encoded = loanRecordType.encode([0n, 0n, 0n, 0n, 0n, 0n]);
      const result = decodeLoanRecord(encoded);

      expect(result.principal).toBe(0n);
      expect(result.userIndexWad).toBe(0n);
    });
  });

  describe('createDepositBoxName', () => {
    it('should create deposit box name with correct format', () => {
      const assetId = 31566704n;

      const boxName = createDepositBoxName(testAddress1, assetId);

      // Should start with prefix
      const prefix = new TextEncoder().encode('deposit_record');
      const prefixMatches = boxName.slice(0, prefix.length).every(
        (byte, i) => byte === prefix[i]
      );

      expect(prefixMatches).toBe(true);
      expect(boxName.length).toBeGreaterThan(prefix.length);
    });

    it('should create different box names for different addresses', () => {
      const assetId = 0n;

      const boxName1 = createDepositBoxName(testAddress1, assetId);
      const boxName2 = createDepositBoxName(testAddress2, assetId);

      expect(boxName1).not.toEqual(boxName2);
    });

    it('should create different box names for different assets', () => {
      const boxName1 = createDepositBoxName(testAddress1, 0n);
      const boxName2 = createDepositBoxName(testAddress1, 31566704n);

      expect(boxName1).not.toEqual(boxName2);
    });
  });

  describe('createLoanBoxName', () => {
    it('should create loan box name with correct format', () => {
      const boxName = createLoanBoxName(testAddress1);

      // Should start with prefix
      const prefix = new TextEncoder().encode('loan_record');
      const prefixMatches = boxName.slice(0, prefix.length).every(
        (byte, i) => byte === prefix[i]
      );

      expect(prefixMatches).toBe(true);
      // Prefix (11 bytes) + address (32 bytes) = 43 bytes
      expect(boxName.length).toBe(prefix.length + 32);
    });

    it('should create different box names for different addresses', () => {
      const boxName1 = createLoanBoxName(testAddress1);
      const boxName2 = createLoanBoxName(testAddress2);

      expect(boxName1).not.toEqual(boxName2);
    });

    it('should create same box name for same address', () => {
      const boxName1 = createLoanBoxName(testAddress1);
      const boxName2 = createLoanBoxName(testAddress1);

      expect(boxName1).toEqual(boxName2);
    });
  });
});

