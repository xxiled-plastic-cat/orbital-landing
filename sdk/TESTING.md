# Testing Guide

This document describes the testing setup and guidelines for the Orbital Finance SDK.

## Test Structure

Tests are organized in `__tests__` directories alongside the source code:

```
src/
├── __tests__/
│   ├── client.test.ts       # OrbitalSDK client tests
│   └── index.test.ts        # Export tests
├── utils/
│   └── __tests__/
│       ├── calculations.test.ts  # Calculation utility tests
│       └── state.test.ts         # State utility tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
pnpm run test

# Run tests in watch mode (re-runs on file changes)
pnpm run test:watch

# Run tests with coverage report
pnpm run test:coverage

# Run tests with interactive UI
pnpm run test:ui
```

### Running Specific Tests

```bash
# Run tests for a specific file
pnpm run test calculations.test.ts

# Run tests matching a pattern
pnpm run test --grep "APY"

# Run tests in a specific directory
pnpm run test src/utils/__tests__
```

## Test Coverage

The SDK aims for high test coverage across all modules:

- **Calculation utilities**: 100% coverage (all branches)
- **State utilities**: 95%+ coverage
- **Client methods**: 90%+ coverage
- **Integration tests**: Key workflows covered

View coverage report:

```bash
pnpm run test:coverage
```

This generates:
- Terminal output with coverage summary
- HTML report in `coverage/index.html`
- JSON report in `coverage/coverage-final.json`

## Writing Tests

### Test File Naming

- Place tests in `__tests__` directory next to source files
- Name test files with `.test.ts` suffix
- Mirror source file names: `calculations.ts` → `calculations.test.ts`

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myModule', () => {
  describe('myFunction', () => {
    it('should handle normal case', () => {
      const result = myFunction(input);
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      const result = myFunction(edgeInput);
      expect(result).toBe(edgeExpected);
    });

    it('should throw error for invalid input', () => {
      expect(() => myFunction(invalidInput)).toThrow();
    });
  });
});
```

### Mocking

For tests that interact with external services (Algod client):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('algosdk', () => ({
  Algodv2: vi.fn(),
  // ... other mocks
}));

describe('with mocks', () => {
  beforeEach(() => {
    // Setup mocks
    mockClient.someMethod.mockReturnValue({
      do: vi.fn().mockResolvedValue(mockData),
    });
  });

  it('should use mocked client', async () => {
    const result = await functionUsingClient();
    expect(result).toBeDefined();
  });
});
```

## Test Categories

### Unit Tests

Test individual functions in isolation:

```typescript
describe('calculateLSTPrice', () => {
  it('should return 1.0 for initial state', () => {
    const result = calculateLSTPrice(0n, 0n);
    expect(result).toBe(1.0);
  });
});
```

### Integration Tests

Test multiple components working together:

```typescript
describe('OrbitalSDK integration', () => {
  it('should fetch and calculate market data', async () => {
    const sdk = new OrbitalSDK(config);
    const market = await sdk.getMarket(appId);
    expect(market.supplyApy).toBeGreaterThanOrEqual(0);
  });
});
```

### Edge Cases

Always test edge cases:

- Zero values
- Maximum values
- Empty/null inputs
- Division by zero scenarios
- Overflow/underflow conditions

```typescript
it('should handle 0% utilization', () => {
  const result = utilNormBps(10000n, 0n, 10000n);
  expect(result).toBe(0n);
});

it('should cap at maximum', () => {
  const result = utilNormBps(10000n, 20000n, 8000n);
  expect(result).toBe(8000n);
});
```

## Continuous Integration

Tests run automatically on:

- Every push to `main` or `develop` branches
- Every pull request
- Multiple Node.js versions (18.x, 20.x)

See `.github/workflows/test.yml` for CI configuration.

## Best Practices

1. **Write tests first** - Consider TDD for new features
2. **Test behavior, not implementation** - Focus on what functions do, not how
3. **Use descriptive test names** - Clearly state what is being tested
4. **Keep tests focused** - One assertion per test when possible
5. **Mock external dependencies** - Don't make real network calls
6. **Test error cases** - Don't just test the happy path
7. **Maintain test independence** - Tests should not depend on each other
8. **Use beforeEach for setup** - Reset state between tests
9. **Avoid test duplication** - Use test helpers for common patterns
10. **Keep tests fast** - Unit tests should run in milliseconds

## Debugging Tests

### Run single test

```bash
pnpm run test:watch
# Then press 't' and type pattern
```

### Use debugger

```typescript
it('should debug this test', () => {
  debugger; // Breakpoint
  const result = myFunction();
  expect(result).toBe(expected);
});
```

### Verbose output

```bash
pnpm run test -- --reporter=verbose
```

## Common Issues

### Mock not working

Ensure mocks are defined before imports:

```typescript
vi.mock('module', () => ({ ... })); // Must be at top

import { MyClass } from 'module'; // After mock
```

### Async test timeout

Increase timeout for slow operations:

```typescript
it('should handle slow operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### BigInt serialization

Vitest can't serialize BigInt in snapshots. Convert to string:

```typescript
expect(result.toString()).toBe('1000000');
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Algosdk Documentation](https://algorand.github.io/js-algorand-sdk/)

