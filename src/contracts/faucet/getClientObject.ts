import { TransactionSigner } from "algosdk";
import { TokenFaucetClient } from "./token-faucetClient";
import * as algokit from "@algorandfoundation/algokit-utils";
import { IS_TESTNET, NETWORK_TOKEN } from "../../constants/constants";

export async function getExistingClient(
  signer: TransactionSigner,
  activeAddress: string,
  appId: number
): Promise<TokenFaucetClient> {
  let algorand;
  if (IS_TESTNET) {
    algorand = algokit.AlgorandClient.fromConfig({
      algodConfig: {
        server: "https://testnet-api.4160.nodely.dev",
        token: NETWORK_TOKEN,
      },
    });
  } else {
    algorand = algokit.AlgorandClient.fromConfig({
      algodConfig: {
        server: "https://mainnet-api.4160.nodely.dev",
        token: NETWORK_TOKEN,
      },
    });
  }
  algorand.setDefaultValidityWindow(1000);

  const appClient = new TokenFaucetClient({
    algorand, // your AlgorandClient instance
    appId: BigInt(appId), // the application ID
    defaultSender: activeAddress,
    defaultSigner: signer,
  });

  return appClient;
}
