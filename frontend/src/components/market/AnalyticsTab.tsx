import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { LendingMarket } from "../../types/lending";

interface AnalyticsTabProps {
  market: LendingMarket;
}

const AnalyticsTab = ({ market }: AnalyticsTabProps) => {
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
            Analytics
          </h2>
        </div>
        
        <div className="text-center py-12">
          <p className="text-slate-400 font-mono text-sm">
            Analytics content coming soon...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

