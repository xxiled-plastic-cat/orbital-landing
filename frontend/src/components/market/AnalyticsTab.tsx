import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LendingMarket } from "../../types/lending";
import { useMarketAnalytics } from "../../hooks/useMarketAnalytics";
import MomentumSpinner from "../MomentumSpinner";

interface AnalyticsTabProps {
  market: LendingMarket;
}

interface ChartDataPoint {
  date: string;
  tvl: number;
  borrowing: number;
  dateLabel: string;
}

interface FeesChartDataPoint {
  date: string;
  lenderInterestFees: number;
  additionalRewards: number;
  dateLabel: string;
}

const AnalyticsTab = ({ market }: AnalyticsTabProps) => {
  const { data: analyticsData, isLoading, error } = useMarketAnalytics(market.id);

  // Combine historical data with current live data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const dataPoints: ChartDataPoint[] = [];

    // Add historical data points
    if (analyticsData && analyticsData.length > 0) {
      analyticsData.forEach((point) => {
        const date = new Date(point.dateAdded);
        dataPoints.push({
          date: date.toISOString(),
          tvl: point.tvl,
          borrowing: point.borrowing,
          dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        });
      });
    }

    // Add current live data as the final point
    const currentDate = new Date();
    dataPoints.push({
      date: currentDate.toISOString(),
      tvl: market.totalDepositsUSD || 0,
      borrowing: market.totalBorrowsUSD || 0,
      dateLabel: 'Now',
    });

    // Sort by date to ensure chronological order
    return dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [analyticsData, market.totalDepositsUSD, market.totalBorrowsUSD]);

  // Calculate fees and rewards data
  const feesChartData = useMemo<FeesChartDataPoint[]>(() => {
    const dataPoints: FeesChartDataPoint[] = [];
    const baseTokenDecimals = market.baseTokenDecimals || 6;
    const baseTokenPrice = market.baseTokenPrice || 0;

    if (!analyticsData || analyticsData.length === 0) {
      return dataPoints;
    }

    // Sort by date to ensure chronological order
    const sortedData = [...analyticsData].sort(
      (a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
    );

    let accumulatedAdditionalRewardsUSD = 0;
    let previousCommissionEarned: bigint | null = null;

    sortedData.forEach((point) => {
      const date = new Date(point.dateAdded);
      
      // Calculate accumulated lender interest fees: feePool * 9 (90% goes to lenders)
      // feePool is cumulative, so we use the current value directly
      let accumulatedLenderInterestFeesUSD = 0;
      if (point.feePool) {
        const feePoolBigInt = BigInt(point.feePool);
        const lenderShare = feePoolBigInt * 9n; // 90% of total interest
        const lenderShareNum = Number(lenderShare) / Math.pow(10, baseTokenDecimals);
        accumulatedLenderInterestFeesUSD = lenderShareNum * baseTokenPrice;
      }

      // Calculate accumulated additional rewards: difference in total_commission_earned
      // total_commission_earned is cumulative, so we track the difference and accumulate
      if (point.totalCommissionEarned) {
        const currentCommission = BigInt(point.totalCommissionEarned);
        
        if (previousCommissionEarned !== null && currentCommission >= previousCommissionEarned) {
          const diff = currentCommission - previousCommissionEarned;
          const diffNum = Number(diff) / Math.pow(10, baseTokenDecimals);
          accumulatedAdditionalRewardsUSD += diffNum * baseTokenPrice;
        } else if (previousCommissionEarned === null) {
          // First entry - use the full value
          const commissionNum = Number(currentCommission) / Math.pow(10, baseTokenDecimals);
          accumulatedAdditionalRewardsUSD = commissionNum * baseTokenPrice;
        }
        
        previousCommissionEarned = currentCommission;
      }

      dataPoints.push({
        date: date.toISOString(),
        lenderInterestFees: accumulatedLenderInterestFeesUSD,
        additionalRewards: accumulatedAdditionalRewardsUSD,
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    });

    return dataPoints;
  }, [analyticsData, market.baseTokenDecimals, market.baseTokenPrice]);

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      payload: ChartDataPoint | FeesChartDataPoint;
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const getLabel = (name: string) => {
        switch (name) {
          case 'tvl': return 'TVL';
          case 'borrowing': return 'Borrowing';
          case 'lenderInterestFees': return 'Lender Interest Fees';
          case 'additionalRewards': return 'Additional Rewards';
          default: return name;
        }
      };

      return (
        <div className="bg-slate-800 border border-slate-600 cut-corners-sm p-3 shadow-lg">
          <p className="text-slate-400 text-xs font-mono mb-2">
            {payload[0]?.payload?.dateLabel || 'Date'}
          </p>
          {payload.map((entry) => (
            <p key={entry.name} className="text-sm font-mono" style={{ color: entry.color }}>
              {getLabel(entry.name)}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <motion.div
        className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
          <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide">
            TVL / Borrowing History
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MomentumSpinner
              size="48"
              speed="1.1"
              color="#06b6d4"
              className="mb-4"
            />
            <p className="text-slate-400 font-mono text-sm">
              Loading analytics data...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 font-mono text-sm mb-2">
              Failed to load analytics data
            </p>
            <p className="text-slate-500 font-mono text-xs">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis
                    dataKey="dateLabel"
                    stroke="#94a3b8"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                      return `$${value}`;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="tvl"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="TVL"
                  />
                  <Line
                    type="monotone"
                    dataKey="borrowing"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Borrowing"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="inset-panel cut-corners-sm p-4">
                <div className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">
                  Current TVL
                </div>
                <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                  {formatCurrency(market.totalDepositsUSD || 0)}
                </div>
              </div>
              <div className="inset-panel cut-corners-sm p-4">
                <div className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">
                  Current Borrowing
                </div>
                <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                  {formatCurrency(market.totalBorrowsUSD || 0)}
                </div>
              </div>
            </div>

            {chartData.length === 1 && (
              <div className="text-center py-4">
                <p className="text-slate-400 font-mono text-sm">
                  Historical data collection is in progress. Chart will update as more data becomes available.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Fees and Rewards Chart */}
      <motion.div
        className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
          <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide">
            Interest Fees & Rewards Accumulated
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MomentumSpinner
              size="48"
              speed="1.1"
              color="#06b6d4"
              className="mb-4"
            />
            <p className="text-slate-400 font-mono text-sm">
              Loading fees and rewards data...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 font-mono text-sm mb-2">
              Failed to load fees and rewards data
            </p>
            <p className="text-slate-500 font-mono text-xs">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        ) : feesChartData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 font-mono text-sm">
              Historical fees and rewards data collection is in progress. Chart will update as more data becomes available.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={feesChartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis
                    dataKey="dateLabel"
                    stroke="#94a3b8"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                      return `$${value}`;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="lenderInterestFees"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Lender Interest Fees"
                  />
                  <Line
                    type="monotone"
                    dataKey="additionalRewards"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: '#a855f7', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Additional Rewards"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="inset-panel cut-corners-sm p-4">
                <div className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">
                  Total Lender Interest Fees
                </div>
                <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
                  {formatCurrency(
                    feesChartData.reduce((sum, point) => sum + point.lenderInterestFees, 0)
                  )}
                </div>
              </div>
              <div className="inset-panel cut-corners-sm p-4">
                <div className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">
                  Total Additional Rewards
                </div>
                <div className="text-xl font-mono font-bold text-purple-400 tabular-nums">
                  {formatCurrency(
                    feesChartData.reduce((sum, point) => sum + point.additionalRewards, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;
