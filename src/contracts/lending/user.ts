import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { getExistingClient } from "./getclient";
import { DepositParams } from "./interface";

export async function deposit({
  address,
  amount,
  appId,
  depositAssetId,
  signer,
}: DepositParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);

    const mbrTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      amount: AlgoAmount.MicroAlgos(1000n),
      receiver: appClient.appAddress,
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });
    const depositTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: address,
      receiver: appClient.appAddress,
      assetId: BigInt(depositAssetId),
      amount: BigInt(amount),
      note: "Depositing " + depositAssetId,
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    const group = appClient.newGroup();
    const result = await group
      .depositAsa({
        args: [depositTxn, amount, mbrTxn],
        assetReferences: [BigInt(depositAssetId)],
        sender: address,
      })
      .send({
        coverAppCallInnerTransactionFees: true,
        populateAppCallResources: true,
        suppressLog: true,
      });

    return result.txIds[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}
