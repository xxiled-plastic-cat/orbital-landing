import React from "react";

interface BuyOnCompxButtonProps {
  tokenSymbol: string;
  tokenId: string;
  hasBalance: boolean;
}

export const BuyOnCompxButton: React.FC<BuyOnCompxButtonProps> = ({
  tokenSymbol,
  tokenId,
  hasBalance,
}) => {
  // Only show button when user has no balance
  if (hasBalance) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const swapUrl = `https://app.compx.io/swap?asset_1=0&asset_2=${tokenId}`;
    window.open(swapUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-shrink-0 ml-4 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-cyan-400 font-mono text-xs uppercase tracking-wider cut-corners-sm transition-all duration-150 border border-cyan-500 hover:border-cyan-400 flex items-center space-x-2"
    >
      <img
        src="/compx-logo-small.png"
        alt="Compx"
        className="w-5 h-5"
      />
      <span className="text-white">Buy <span className="text-compx-pink">{tokenSymbol}</span> on CompX</span>
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </button>
  );
};

