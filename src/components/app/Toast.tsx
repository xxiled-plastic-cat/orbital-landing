import classNames from "classnames";
import { useToast } from "../context/toastContext";
import {
  CheckCheckIcon,
  XCircleIcon,
  StarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CgSpinner } from "react-icons/cg";
import { useRef } from "react";

export const Toast = () => {
  const toastContext = useToast();
  const { toast, toastVisible } = toastContext;

  // Create a unique ID for this toast instance to prevent key conflicts
  const toastInstanceRef = useRef(Date.now());

  const handleCloseToast = () => {
    toastContext.closeToast();
  };

  const toastClasses = classNames("sm:w-96 border", {
    " border-green-500": toast.type === "success",
    " border-red-500": toast.type === "error",
    " border-blue-500": toast.type === "loading" || toast.type === "multi-step",
    " border-pink-accent": toast.type === "reward",
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
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Step Progress */}
        <div className="text-xs text-gray-300">
          Step {toast.currentStepIndex + 1} of {toast.steps.length}
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {toast.steps.map((step, index) => (
            <div
              key={`toast-${toastInstanceRef.current}-step-${step.id}-${index}`}
              className={classNames("flex items-center space-x-3 text-sm", {
                "text-blue-400": index === toast.currentStepIndex,
                "text-green-400": index < toast.currentStepIndex!,
                "text-gray-500": index > toast.currentStepIndex!,
              })}
            >
              <div className="flex-shrink-0">
                {index < toast.currentStepIndex! ? (
                  <CheckCheckIcon className="w-4 h-4" />
                ) : index === toast.currentStepIndex ? (
                  <CgSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-500 rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{step.name}</div>
                {index === toast.currentStepIndex && (
                  <div className="text-xs text-gray-400 mt-1">
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
        <div className="absolute w-screen h-screen py-5 top-0 flex items-start justify-center text-white">
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
            } pt-3 pb-4 px-4 rounded-2xl bg-dark-bg/40 backdrop-blur-xl fixed top-5 z-[10001]`}
          >
            <div className="w-full flex justify-end">
              <button className="cursor-pointer" onClick={handleCloseToast}>
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-start gap-2">
              <div className="flex flex-col justify-start items-start">
                {toast.type === "loading" && (
                  <CgSpinner className="h-8 w-8 animate-spin text-blue-400" />
                )}
                {toast.type === "success" && (
                  <CheckCheckIcon className="w-8 h-8 " />
                )}
                {toast.type === "error" && <XCircleIcon className="w-8 h-8 " />}
                {toast.type === "multi-step" && (
                  <CgSpinner className="h-8 w-8 animate-spin text-blue-400" />
                )}
                {toast.type === "reward" && (
                  <StarIcon className="w-8 h-8 text-pink-accent" />
                )}
              </div>
              <div className="flex flex-col justify-start items-start gap-2 px-2 flex-1">
                <h4 className="text-lg font-bold font-display">
                  {toast.message}
                </h4>
                {toast.type !== "multi-step" && toast.description && (
                  <div className="text-sm">{toast.description}</div>
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
