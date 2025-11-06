import { Request, Response } from 'express';
import { fetchAssetMetadata } from '../services/oracleService.js';

export const getAssetMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetIds } = req.body;
    
    if (!assetIds || !Array.isArray(assetIds)) {
      res.status(400).json({
        success: false,
        error: 'Invalid request. Expected { assetIds: number[] }'
      });
      return;
    }

    // Convert string IDs to numbers
    const numericAssetIds = assetIds.map((id: string | number) => 
      typeof id === 'string' ? parseInt(id, 10) : id
    ).filter(id => !isNaN(id));

    if (numericAssetIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid asset IDs provided'
      });
      return;
    }

    console.log(`Fetching metadata for ${numericAssetIds.length} assets:`, numericAssetIds);

    // Fetch metadata from CompX API
    const metadataMap = await fetchAssetMetadata(numericAssetIds);

    // Convert Map to object with asset IDs as keys
    const response: Record<string, any> = {};
    
    numericAssetIds.forEach((assetId) => {
      const metadata = metadataMap.get(assetId);
      if (metadata) {
        response[assetId.toString()] = {
          name: metadata.params.name || `Asset ${assetId}`,
          symbol: metadata.params['unit-name'] || metadata.params.name || `TKN${assetId}`,
          decimals: metadata.params.decimals || 6,
          image: metadata.image,
          verified: metadata.verified,
          total: metadata.params.total,
          frozen: metadata.params['is-frozen'] || false
        };
      } else {
        // Provide fallback for assets without metadata
        response[assetId.toString()] = {
          name: `Asset ${assetId}`,
          symbol: `TKN${assetId.toString().slice(-4)}`,
          decimals: 6,
          verified: false,
          frozen: false
        };
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching asset metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset metadata',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

