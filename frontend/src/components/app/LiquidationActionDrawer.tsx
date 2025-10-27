import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ShoppingCart } from "lucide-react";
import LiquidationActionPanel from "./LiquidationActionPanel";
import { DebtPosition, LendingMarket } from "../../types/lending";

interface LiquidationActionDrawerProps {
  position: DebtPosition;
  market?: LendingMarket;
  isExecuting: boolean;
  liquidationAmount: string;
  setLiquidationAmount: (value: string) => void;
  onLiquidate: () => void;
  onBuyout: () => void;
}

const LiquidationActionDrawer = (props: LiquidationActionDrawerProps) => {
  const { position } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Determine if this is liquidation zone or buyout zone
  const actualLiquidationThreshold = position.liquidationThreshold > 0 ? 1 / position.liquidationThreshold : 1.2;
  const isLiquidationZone = position.healthRatio <= actualLiquidationThreshold;

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <LiquidationActionPanel {...props} />
      </motion.div>
    );
  }

  return (
    <>
      {/* Mobile Bottom Trigger Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-noise-dark border-t-2 border-slate-600 p-3 backdrop-blur-md"
        style={{ 
          zIndex: 10001, 
          position: 'fixed',
          isolation: 'isolate',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className={`w-full h-14 px-4 cut-corners-md bg-gradient-to-br border-2 transition-all duration-200 shadow-lg group ${
            isLiquidationZone
              ? "from-red-600 to-red-700 border-red-500 hover:from-red-500 hover:to-red-600"
              : "from-cyan-600 to-cyan-700 border-cyan-500 hover:from-cyan-500 hover:to-cyan-600"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
              isLiquidationZone
                ? "from-red-700 to-red-800"
                : "from-cyan-700 to-cyan-800"
            }`}>
              {isLiquidationZone ? (
                <Zap className="w-4 h-4 text-white" />
              ) : (
                <ShoppingCart className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="text-center">
              <div className="font-mono text-base font-bold text-white uppercase tracking-wide">
                {isLiquidationZone ? "LIQUIDATE" : "BUYOUT"}
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Bottom Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10002]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t-2 border-slate-600 shadow-2xl z-[10003] flex flex-col"
              style={{ height: "85vh", maxHeight: "85vh" }}
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
              <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
                <div className="w-12 h-1 bg-slate-600 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className={`flex items-center justify-between p-4 border-b bg-slate-900/80 backdrop-blur-sm flex-shrink-0 ${
                isLiquidationZone ? "border-red-500/50" : "border-cyan-500/50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center ${
                    isLiquidationZone
                      ? "from-red-600 to-red-700"
                      : "from-cyan-600 to-cyan-700"
                  }`}>
                    {isLiquidationZone ? (
                      <Zap className="w-4 h-4 text-white" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide">
                    {isLiquidationZone ? "Liquidate Position" : "Buyout Position"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors hover:bg-slate-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content - Scrollable Area */}
              <div className="flex-1 overflow-y-auto overscroll-contain pb-6" style={{ minHeight: 0 }}>
                <motion.div
                  className="p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <LiquidationActionPanel {...props} />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiquidationActionDrawer;

