/**
 * Price Calculation Utilities
 * Handles price comparison, median calculation, and change detection
 */

/**
 * Calculate the median of an array of prices
 * @param prices - Array of price values
 * @returns The median price
 */
export function calculateMedian(prices: number[]): number {
  if (!prices || prices.length === 0) {
    throw new Error('Cannot calculate median of empty array');
  }

  // Filter out null/undefined/invalid values
  const validPrices = prices.filter(
    (price) => price !== null && price !== undefined && !isNaN(price) && price > 0
  );

  if (validPrices.length === 0) {
    throw new Error('No valid prices to calculate median');
  }

  // Sort prices in ascending order
  const sorted = [...validPrices].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  // If even number of prices, return average of two middle values
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  // If odd number of prices, return middle value
  return sorted[middle];
}

/**
 * Calculate the percentage change between two prices
 * @param oldPrice - The old price
 * @param newPrice - The new price
 * @returns The percentage change (absolute value)
 */
export function calculatePriceChange(oldPrice: number, newPrice: number): number {
  if (!oldPrice || oldPrice === 0) {
    return 100; // Consider it a 100% change if old price is zero
  }

  return Math.abs(((newPrice - oldPrice) / oldPrice) * 100);
}

/**
 * Check if price update is needed based on threshold
 * @param oldPrice - The current price
 * @param newPrice - The new price to compare
 * @param threshold - The percentage threshold for update (default: 0.05%)
 * @returns True if update is needed
 */
export function shouldUpdatePrice(oldPrice: number, newPrice: number, threshold: number = 0.05): boolean {
  const change = calculatePriceChange(oldPrice, newPrice);
  return change >= threshold;
}

/**
 * Calculate average of prices (simple mean)
 * @param prices - Array of price values
 * @returns The average price
 */
export function calculateAverage(prices: number[]): number {
  if (!prices || prices.length === 0) {
    throw new Error('Cannot calculate average of empty array');
  }

  const validPrices = prices.filter(
    (price) => price !== null && price !== undefined && !isNaN(price) && price > 0
  );

  if (validPrices.length === 0) {
    throw new Error('No valid prices to calculate average');
  }

  const sum = validPrices.reduce((acc, price) => acc + price, 0);
  return sum / validPrices.length;
}

/**
 * Validate price data
 * @param price - The price to validate
 * @returns True if price is valid
 */
export function isValidPrice(price: number | null | undefined): price is number {
  return (
    price !== null &&
    price !== undefined &&
    !isNaN(price) &&
    price > 0 &&
    isFinite(price)
  );
}

/**
 * Format price for logging
 * @param price - The price to format
 * @param decimals - Number of decimal places (default: 6)
 * @returns Formatted price string
 */
export function formatPrice(price: number | null | undefined, decimals: number = 6): string {
  if (!isValidPrice(price)) {
    return 'Invalid Price';
  }
  return price.toFixed(decimals);
}

