import { useState, useEffect } from "react";
import type { NetworkType } from "../context/networkContext";

// Get the current network from localStorage
function getCurrentNetwork(): NetworkType {
  const stored = localStorage.getItem('orbital-preferred-network');
  return (stored as NetworkType) || 'testnet';
}

function isTestnet(): boolean {
  return getCurrentNetwork() === 'testnet';
}

// Testnet hardcoded collateral token data
const TESTNET_COLLATERAL_TOKENS: Record<
  string,
  {
    symbol: string;
    name: string;
    decimals: number;
    image?: string;
  }
> = {
  "748908019": {
    symbol: "cCOMPXt",
    name: "Collateralized COMPX Testnet",
    decimals: 6,
    image: "/COMPXt.svg",
  },
  "748908221": {
    symbol: "cxUSDt",
    name: "Collateralized xUSDt Testnet",
    decimals: 6,
    image: "/cxUSDt.svg",
  },
  "748119416": {
    symbol: "cUSDCt",
    name: "Collateralized USDCt Testnet",
    decimals: 6,
    image: "/cUSDCt.svg",
  },
  "747010926": {
    symbol: "cgoBTCt",
    name: "Collateralized goBTCt Testnet",
    decimals: 8,
    image: "/cgoBTCt.svg",
  },
  "747010543": {
    symbol: "cALGO",
    name: "Collateralized ALGO Testnet",
    decimals: 6,
    image: "/cAlgo.svg",
  },
};

// Network configuration is now handled by constants

export interface CollateralTokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  image?: string;
}

export const useCollateralTokens = (
  acceptedCollateral?: Map<unknown, unknown>
) => {
  const [collateralTokens, setCollateralTokens] = useState<
    Record<string, CollateralTokenInfo>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch collateral token metadata
  const fetchCollateralTokens = async (assetIds: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isTestnet()) {
        // Use hardcoded testnet data
        const tokens: Record<string, CollateralTokenInfo> = {};
        assetIds.forEach((assetId) => {
          if (TESTNET_COLLATERAL_TOKENS[assetId]) {
            tokens[assetId] = TESTNET_COLLATERAL_TOKENS[assetId];
          } else {
            // Fallback for unknown testnet assets
            tokens[assetId] = {
              symbol: `cASA${assetId}`,
              name: `Collateral Asset ${assetId}`,
              decimals: 6,
            };
          }
        });
        setCollateralTokens(tokens);
      } else {
        // Fetch from backend for mainnet
        const response = await fetch("/api/tokens/metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assetIds }),
        });

        if (response.ok) {
          const tokens = await response.json();
          setCollateralTokens(tokens);
        } else {
          throw new Error("Failed to fetch token metadata");
        }
      }
    } catch (err) {
      console.error("Error fetching token metadata:", err);
      setError(err instanceof Error ? err.message : "Unknown error");

      // Fallback to generic names
      const fallbackTokens: Record<string, CollateralTokenInfo> = {};
      assetIds.forEach((assetId) => {
        fallbackTokens[assetId] = {
          symbol: `Asset ${assetId}`,
          name: `Asset ${assetId}`,
          decimals: 6,
        };
      });
      setCollateralTokens(fallbackTokens);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract asset IDs from acceptedCollateral Map and fetch token data
  useEffect(() => {
    if (acceptedCollateral && acceptedCollateral.size > 0) {
      const assetIds: string[] = [];

      for (const [assetId] of acceptedCollateral) {
        // Handle the case where assetId might be an object
        let actualAssetId: string;
        if (typeof assetId === "object" && assetId !== null) {
          // If assetId is an object, try to get the assetId property from it
          actualAssetId = String(
            (assetId as { assetId?: string | number }).assetId || assetId
          );
        } else {
          actualAssetId = String(assetId);
        }

        if (actualAssetId && actualAssetId !== "[object Object]") {
          assetIds.push(actualAssetId);
        }
      }

      if (assetIds.length > 0) {
        fetchCollateralTokens(assetIds);
      }
    }
  }, [acceptedCollateral]);

  // Helper function to get processed collateral assets with user balances
  const getCollateralAssets = (userAssets?: {
    assets: Array<{
      assetId: string;
      balance: string;
      isOptedIn: boolean;
    }>;
  }) => {
    if (!acceptedCollateral) return [];

    const collateralAssets = [];
    for (const [assetId, collateralData] of acceptedCollateral) {
      // Handle the case where assetId might be an object
      let actualAssetId: string;
      if (typeof assetId === "object" && assetId !== null) {
        actualAssetId = String(
          (assetId as { assetId?: string | number }).assetId || assetId
        );
      } else {
        actualAssetId = String(assetId);
      }

      if (actualAssetId && actualAssetId !== "[object Object]") {
        const tokenInfo = collateralTokens[actualAssetId];

        // Get user balance for this asset (if they have it)
        const userAsset = userAssets?.assets.find(
          (a) => a.assetId === actualAssetId && a.isOptedIn
        );

        collateralAssets.push({
          assetId: actualAssetId,
          symbol: tokenInfo?.symbol || `cASA${actualAssetId}`,
          balance: userAsset?.balance || "0",
          name: tokenInfo?.name || `Collateral Asset ${actualAssetId}`,
          image: tokenInfo?.image,
          decimals: tokenInfo?.decimals || 6,
          totalCollateral:
            (collateralData as { totalCollateral?: number })?.totalCollateral ||
            0,
        });
      }
    }

    return collateralAssets;
  };

  return {
    collateralTokens,
    isLoading,
    error,
    getCollateralAssets,
    refetch: () => {
      if (acceptedCollateral && acceptedCollateral.size > 0) {
        const assetIds: string[] = [];
        for (const [assetId] of acceptedCollateral) {
          let actualAssetId: string;
          if (typeof assetId === "object" && assetId !== null) {
            actualAssetId = String(
              (assetId as { assetId?: string | number }).assetId || assetId
            );
          } else {
            actualAssetId = String(assetId);
          }
          if (actualAssetId && actualAssetId !== "[object Object]") {
            assetIds.push(actualAssetId);
          }
        }
        if (assetIds.length > 0) {
          fetchCollateralTokens(assetIds);
        }
      }
    },
  };
};
