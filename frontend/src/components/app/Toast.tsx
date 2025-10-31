import classNames from "classnames";
import { useToast } from "../../context/toastContext";
import {
  CheckCheckIcon,
  XCircleIcon,
  StarIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MomentumSpinner from "../MomentumSpinner";
import { useRef } from "react";

export const Toast = () => {
  const toastContext = useToast();
  const { toast, toastVisible } = toastContext;

  // Create a unique ID for this toast instance to prevent key conflicts
  const toastInstanceRef = useRef(Date.now());

  const handleCloseToast = () => {
    toastContext.closeToast();
  };

  const toastClasses = classNames("sm:w-96 border-2", {
    " border-cyan-500": toast.type === "success",
    " border-red-400": toast.type === "error",
    " border-cyan-600": toast.type === "loading" || toast.type === "multi-step",
    " border-amber-500": toast.type === "reward",
  });

  const getProgressPercentage = () => {
    if (!toast.steps || toast.currentStepIndex === undefined) return 0;
    return ((toast.currentStepIndex + 1) / toast.steps.length) * 100;
  };

  const renderMultiStepContent = () => {
    if (!toast.steps || toast.currentStepIndex === undefined) return null;

    return (
      <div className="mt-3 space-y-3">
        {/* Progress Bar */}
        <div className="w-full bg-slate-700 cut-corners-sm h-2">
          <div
            className="bg-cyan-400 h-2 cut-corners-sm transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Step Progress */}
        <div className="text-xs font-mono text-slate-300 uppercase tracking-wide">
          Step {toast.currentStepIndex + 1} of {toast.steps.length}
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {toast.steps.map((step, index) => (
            <div
              key={`toast-${toastInstanceRef.current}-step-${step.id}-${index}`}
              className={classNames("flex items-center space-x-3 text-sm font-mono", {
                "text-cyan-400": index === toast.currentStepIndex,
                "text-cyan-300": index < toast.currentStepIndex!,
                "text-slate-500": index > toast.currentStepIndex!,
              })}
            >
              <div className="flex-shrink-0">
                {index < toast.currentStepIndex! ? (
                  <CheckCheckIcon className="w-4 h-4" />
                ) : index === toast.currentStepIndex ? (
                  <MomentumSpinner size="16" speed="1.1" color="#06b6d4" />
                ) : (
                  <div className="w-4 h-4 border-2 border-slate-500 cut-corners-sm" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{step.name}</div>
                {index === toast.currentStepIndex && (
                  <div className="text-xs text-slate-400 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {toastVisible && (
        <div className="fixed inset-0 py-5 flex items-start justify-center text-white pointer-events-none z-[10000]">
          <motion.div
            initial={{ y: -400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -400, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={`${toastClasses} ${
              toast.type === "multi-step"
                ? "w-[20rem] sm:w-[28rem]"
                : "w-80 sm:w-96"
            } cut-corners-lg pt-3 pb-4 px-4 bg-noise-dark shadow-industrial pointer-events-auto`}
          >
            <div className="w-full flex justify-end">
              <button 
                className="cursor-pointer cut-corners-sm p-1 border border-slate-500 bg-slate-700 hover:bg-slate-600 hover:border-slate-400 transition-colors"
                onClick={handleCloseToast}
              >
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex flex-col justify-start items-start flex-shrink-0">
                {toast.type === "loading" && (
                  <MomentumSpinner size="32" speed="1.1" color="#06b6d4" />
                )}
                {toast.type === "success" && (
                  <CheckCheckIcon className="w-8 h-8 text-cyan-400" />
                )}
                {toast.type === "error" && <XCircleIcon className="w-8 h-8 text-red-400" />}
                {toast.type === "multi-step" && (
                  <MomentumSpinner size="32" speed="1.1" color="#06b6d4" />
                )}
                {toast.type === "reward" && (
                  <StarIcon className="w-8 h-8 text-amber-400" />
                )}
              </div>
              <div className="flex flex-col justify-start items-start gap-2 px-2 flex-1 min-w-0 overflow-hidden">
                <h4 className="text-lg font-bold font-mono text-white break-words w-full">
                  {toast.message}
                </h4>
                {toast.type !== "multi-step" && toast.description && (
                  <div className="text-sm font-mono text-slate-300 break-all w-full">
                    {toast.description}
                  </div>
                )}
                {toast.type === "multi-step" && renderMultiStepContent()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
