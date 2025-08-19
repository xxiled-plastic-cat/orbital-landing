import { TransactionSigner } from "algosdk";
import { OracleClient } from "./oracleClient";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";

export async function getExistingClient(
  signer: TransactionSigner,
  activeAddress: string,
  appId: number
): Promise<OracleClient> {
  const algorand = AlgorandClient.testNet();
  algorand.setDefaultValidityWindow(1000);

  const appClient = new OracleClient({
    algorand, // your AlgorandClient instance
    appId: BigInt(appId), // the application ID
    defaultSender: activeAddress,
    defaultSigner: signer,
  });

  return appClient;
}
