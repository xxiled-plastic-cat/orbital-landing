import { useQuery } from "@tanstack/react-query";

// NFD data interface
interface NFDData {
  name: string;
  avatar?: string;
}

// NFD fetching function
async function getNFD(address: string): Promise<NFDData | null> {
  const nfdURL = `https://api.nf.domains/nfd/address?address=${address}&limit=1&view=thumbnail`;
  try {
    const nfdURLResponseData = await fetch(nfdURL);
    const nfdURLResponse = await nfdURLResponseData.json();
    
    if (
      !nfdURLResponse ||
      !Array.isArray(nfdURLResponse) ||
      nfdURLResponse.length !== 1
    ) {
      return null;
    }
    
    const nfdBlob = nfdURLResponse[0];
    if (!nfdBlob.depositAccount || nfdBlob.depositAccount !== address) {
      return null;
    }
    
    const nfdData: NFDData = {
      name: nfdBlob.name
    };
    
    // Check for avatar - prioritize userDefined, then verified
    let avatarUrl = null;
    
    // First check userDefined avatar (direct URL)
    if (nfdBlob.properties?.userDefined?.avatar) {
      avatarUrl = nfdBlob.properties.userDefined.avatar;
    }
    // Then check verified avatar (IPFS/NFT)
    else if (nfdBlob.properties?.verified?.avatar) {
      const verifiedAvatar = nfdBlob.properties.verified.avatar;
      
      // Convert IPFS links to HTTP using Algonode
      if (verifiedAvatar.startsWith('ipfs://')) {
        const ipfsHash = verifiedAvatar.replace('ipfs://', '');
        avatarUrl = `https://ipfs.algonode.xyz/ipfs/${ipfsHash}?optimizer=image&width=75`;
      } else {
        // If it's already an HTTP URL, use as-is
        avatarUrl = verifiedAvatar;
      }
    }
    
    if (avatarUrl) {
      nfdData.avatar = avatarUrl;
    }
    
    return nfdData;
  } catch (e) {
    console.error('❌ NFD fetch error:', e);
    return null;
  }
}

/**
 * Custom hook to fetch NFD data for any Algorand address
 * @param address - The Algorand address to lookup
 * @param enabled - Whether to enable the query (default: true if address exists)
 * @returns Object containing NFD name, avatar, and loading state
 */
export function useNFD(address: string | null | undefined, enabled: boolean = true) {
  const {
    data: nfdData,
    isLoading: isLoadingNFD,
    error: nfdError,
  } = useQuery({
    queryKey: ['nfd', address],
    queryFn: () => getNFD(address || ''),
    enabled: !!address && enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    nfdName: nfdData?.name || null,
    nfdAvatar: nfdData?.avatar || null,
    isLoadingNFD,
    nfdError,
  };
}
