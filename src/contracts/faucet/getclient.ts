import { TransactionSigner } from "algosdk";
import { TokenFaucetClient } from "./token-faucetClient";
import * as algokit from "@algorandfoundation/algokit-utils";

export async function getExistingClient(
  signer: TransactionSigner,
  activeAddress: string,
  appId: number
): Promise<TokenFaucetClient> {
  const algorand = algokit.AlgorandClient.testNet();
  algorand.setDefaultValidityWindow(1000);

  const appClient = new TokenFaucetClient({
    algorand, // your AlgorandClient instance
    appId: BigInt(appId), // the application ID
    defaultSender: activeAddress,
    defaultSigner: signer,
  });

  return appClient;
}
