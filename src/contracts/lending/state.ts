import { TransactionSigner } from "algosdk";
import { getExistingClient } from "./getClient";

export async function getContractState(
  address: string,
  appId: number,
  signer: TransactionSigner
) {
  const appClient = await getExistingClient(signer, address, appId);
  appClient.algorand.setDefaultSigner(signer);
  const globalState = await appClient.state.global.getAll();
  return globalState;
}

