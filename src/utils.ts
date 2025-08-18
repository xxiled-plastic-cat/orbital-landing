import * as algokit from "@algorandfoundation/algokit-utils";

export function getAlgod() {
  const algorand = algokit.AlgorandClient.testNet();
  algorand.setDefaultValidityWindow(1000);

  return algorand.client.algod;
}
