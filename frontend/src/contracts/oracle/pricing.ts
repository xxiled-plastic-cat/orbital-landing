/* eslint-disable @typescript-eslint/no-unused-vars */
import { getExistingClient } from "./getClient";
import { OraclePricingParams } from "./interface";

export async function getPricing({
  tokenId,
  address,
  signer,
  appId,
}: OraclePricingParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    const boxValues = await appClient.state.box.tokenPrices.getMap();
    for (const v of boxValues) {
      if (v[0].assetId === BigInt(tokenId)) {
        return Number(v[1].price) / 10 ** 6;
      }
    }
    return 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
