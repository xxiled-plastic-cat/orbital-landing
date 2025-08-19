import { TransactionSigner } from "algosdk";
import { OrbitalLendingClient } from "./orbital-lendingClient";
import * as algokit from "@algorandfoundation/algokit-utils";

export async function getExistingClient(
  signer: TransactionSigner,
  activeAddress: string,
  appId: number
): Promise<OrbitalLendingClient> {
  const algorand = algokit.AlgorandClient.testNet();
  algorand.setDefaultValidityWindow(1000);

  const appClient = new OrbitalLendingClient({
    algorand, // your AlgorandClient instance
    appId: BigInt(appId), // the application ID
    defaultSender: activeAddress,
    defaultSigner: signer,
  });

  return appClient;
}
