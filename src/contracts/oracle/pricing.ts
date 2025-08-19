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
    /* const client = await getExistingClient(signer, address, appId);

    const pricing = await client.send.getTokenPrice({
      args: [tokenId],
    }); */

    return 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
