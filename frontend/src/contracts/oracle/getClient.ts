import { TransactionSigner } from "algosdk";
import { OracleClient } from "./oracleClient";
import * as algokit from "@algorandfoundation/algokit-utils";
import { NETWORK_TOKEN } from "../../constants/constants";
import type { NetworkType } from "../../context/networkContext";

// Get the current network from localStorage
function getCurrentNetwork(): NetworkType {
  const stored = localStorage.getItem('orbital-preferred-network');
  return (stored as NetworkType) || 'testnet';
}

export async function getExistingClient(
  signer: TransactionSigner,
  activeAddress: string,
  appId: number
): Promise<OracleClient> {
  const network = getCurrentNetwork();
  const isTestnet = network === 'testnet';
  
  let algorand;
  if (isTestnet) {
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

  const appClient = new OracleClient({
    algorand, // your AlgorandClient instance
    appId: BigInt(appId), // the application ID
    defaultSender: activeAddress,
    defaultSigner: signer,
  });

  return appClient;
}
