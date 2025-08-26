import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, TrendingUp, ArrowDownUp } from "lucide-react";
import ActionPanel from "./ActionPanel";
import { LendingMarket } from "../../types/lending";

interface ActionDrawerProps {
  market: LendingMarket;
  userAssets?: {
    assets: Array<{
      assetId: string;
      balance: string;
      isOptedIn: boolean;
    }>;
  };
  algoBalance?: string;
  isLoadingAssets: boolean;
  transactionLoading: boolean;
  acceptedCollateral?: Map<unknown, unknown>;
  userDebt?: {
    borrowedAmount: string;
    collateralAmount: string;
    collateralAssetId: string;
    interestAccrued: string;
  };
  onDeposit: (amount: string) => void;
  onRedeem: (amount: string) => void;
  onBorrow: (
    collateralAssetId: string,
    collateralAmount: string,
    borrowAmount: string
  ) => void;
  onRepay: (repayAmount: string) => void;
  onWithdrawCollateral?: (collateralAssetId: string, withdrawAmount: string) => void;
}

const ActionDrawer = (props: ActionDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [initialTab, setInitialTab] = useState<"lend" | "borrow">("lend");

  // Function to open drawer with specific tab
  const openDrawerWithTab = (tab: "lend" | "borrow") => {
    setInitialTab(tab);
    setIsOpen(true);
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isOpen]);

  // On desktop, render the ActionPanel with animation wrapper
  if (!isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ActionPanel {...props} />
      </motion.div>
    );
  }

  return (
    <>
      {/* Mobile Bottom Trigger Bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 bg-noise-dark border-t-2 border-slate-600 p-3 backdrop-blur-md"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex gap-2">
          {/* Lend Button */}
          <button
            onClick={() => openDrawerWithTab("lend")}
            className="flex-1 h-14 px-4 cut-corners-md bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 hover:border-cyan-500 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg group"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-cyan-700  flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-mono text-sm font-bold text-white uppercase tracking-wide">
                  LEND
                </div>
                <div className="font-mono text-xs text-slate-400 uppercase tracking-wide">
                  Supply Assets
                </div>
              </div>
            </div>
          </button>

          {/* Borrow Button */}
          <button
            onClick={() => openDrawerWithTab("borrow")}
            className="flex-1 h-14 px-4 cut-corners-md bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 hover:border-blue-500 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg group"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700  flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ArrowDownUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-mono text-sm font-bold text-white uppercase tracking-wide">
                  BORROW
                </div>
                <div className="font-mono text-xs text-slate-400 uppercase tracking-wide">
                  Open Position
                </div>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Bottom Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t-2 border-slate-600 shadow-2xl z-50 overflow-hidden"
              style={{ height: "80vh" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              {/* Drawer Handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-slate-600 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-600 bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide">
                    Market Actions
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors  hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto">
                <motion.div
                  className="p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <ActionPanel {...props} initialTab={initialTab} />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActionDrawer;
