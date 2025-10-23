import React from "react";
import { useNetwork } from "../../context/networkContext";
import Tooltip from "../Tooltip";

const NetworkBadge: React.FC = () => {
  const { isTestnet } = useNetwork();

  return (
    <Tooltip 
      content={
        isTestnet 
          ? "Running on Algorand Testnet - Use test tokens only" 
          : "Running on Algorand Mainnet - Live network"
      } 
      position="bottom"
    >
      <div className={`cut-corners-sm px-2 py-1 md:px-4 md:py-2 border shadow-inset shrink-0 ${
        isTestnet 
          ? 'text-amber-400 border-amber-400' 
          : 'text-cyan-400 border-cyan-400'
      }`}>
        <span className={`text-[10px] sm:text-xs md:text-sm font-mono font-semibold uppercase tracking-wide ${
          isTestnet ? 'text-amber-400' : 'text-cyan-400'
        }`}>
          {isTestnet ? 'TESTNET' : 'MAINNET'}
        </span>
      </div>
    </Tooltip>
  );
};

export default NetworkBadge;

