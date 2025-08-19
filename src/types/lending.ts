// Market data interface
export interface LendingMarket {
  id: string;
  name: string;
  symbol: string;
  image: string;
  ltv: number; // Loan-to-value ratio
  liquidationThreshold: number;
  supplyApr: number;
  borrowApr: number;
  utilizationRate: number;
  totalDeposits: number;
  totalBorrows: number;
  availableToBorrow: number;
  isActive: boolean;
}
