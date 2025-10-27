/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { getExistingClient, getExistingClientAsa } from "./getClient";
import {
  BorrowParams,
  BuyoutAlgoParams,
  BuyoutAsaParams,
  DepositParams,
  getLoanRecordParams,
  getLoanRecordReturnType,
  LiquidateAlgoParams,
  LiquidateAsaParams,
  RepayDebtAlgoParams,
  RepayDebtAsaParams,
  WithdrawCollateralParams,
  WithdrawParams,
} from "./interface";
import { microAlgo } from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";
import { getCollateralBoxValue } from "./state";

export async function depositAsa({
  address,
  amount,
  appId,
  depositAssetId,
  signer,
  lstAssetId,
}: DepositParams) {
  try {
    const appClient = await getExistingClientAsa(signer, address, appId);

    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = amount * 10 ** 6;

    let optInRequired = false;
    const group = appClient.newGroup();
    try {
      await appClient.algorand.client.algod
        .accountAssetInformation(address, lstAssetId)
        .do();
      optInRequired = false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      optInRequired = true;
    }

    console.log("optInRequired", optInRequired);

    const mbrTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      amount: AlgoAmount.MicroAlgos(10_000n),
      receiver: appClient.appAddress,
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });
    const depositTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: address,
      receiver: appClient.appAddress,
      assetId: BigInt(depositAssetId),
      amount: BigInt(upscaledAmount),
      note: "Depositing " + depositAssetId,
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    if (optInRequired) {
      const optInTxn = await appClient.algorand.createTransaction.assetOptIn({
        assetId: BigInt(lstAssetId),
        sender: address,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      });
      group.addTransaction(optInTxn);
    }

    const result = await group
      .depositAsa({
        args: [depositTxn, upscaledAmount, mbrTxn],
        assetReferences: [BigInt(depositAssetId)],
        sender: address,
        maxFee: AlgoAmount.MicroAlgos(250_000),
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

export async function depositAlgo({
  address,
  amount,
  appId,
  depositAssetId,
  signer,
  lstAssetId,
}: DepositParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);

    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = amount * 10 ** 6;

    let optInRequired = false;
    const group = appClient.newGroup();
    try {
      await appClient.algorand.client.algod
        .accountAssetInformation(address, lstAssetId)
        .do();
      optInRequired = false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      optInRequired = true;
    }

    console.log("optInRequired", optInRequired);

    const mbrTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      amount: AlgoAmount.MicroAlgos(1000n),
      receiver: appClient.appAddress,
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });
    const depositTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(upscaledAmount),
      note: "Depositing ALGO",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    if (optInRequired) {
      const optInTxn = await appClient.algorand.createTransaction.assetOptIn({
        assetId: BigInt(lstAssetId),
        sender: address,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      });
      group.addTransaction(optInTxn);
    }

    const result = await group
      .depositAlgo({
        args: [depositTxn, upscaledAmount, mbrTxn],
        assetReferences: [BigInt(depositAssetId)],
        sender: address,
        maxFee: AlgoAmount.MicroAlgos(250_000),
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

export async function withdraw({
  address,
  amount,
  appId,
  lstTokenId,
  signer,
}: WithdrawParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = amount * 10 ** 6;

    const axferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: address,
      receiver: appClient.appAddress,
      assetId: BigInt(lstTokenId),
      amount: BigInt(upscaledAmount),
      note: "Returning lst to contract",
    });

    const mbrTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      receiver: appClient.appAddress,
      amount: microAlgo(3000n),
      note: "Funding withdraw",
    });

    const result = await appClient.send.withdrawDeposit({
      args: [axferTxn, upscaledAmount, appClient.appId, mbrTxn],
      assetReferences: [BigInt(lstTokenId)],
      appReferences: [appClient.appId],
      sender: address,
    });

    return result.txIds[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function borrow({
  address,
  collateralAmount,
  borrowAmount,
  collateralAssetId,
  lstAppId,
  appId,
  oracleAppId,
  signer,
}: BorrowParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledCollateralAmount = collateralAmount * 10 ** 6;
    const upscaledBorrowAmount = borrowAmount * 10 ** 6;

    const collateralAxferTxn =
      appClient.algorand.createTransaction.assetTransfer({
        sender: address,
        receiver: appClient.appAddress,
        assetId: BigInt(collateralAssetId),
        amount: BigInt(upscaledCollateralAmount),
        note: "Depositing collateral: " + collateralAssetId,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      });

    const mbrTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      receiver: appClient.appAddress,
      amount: microAlgo(4000n),
      note: "Funding borrow",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });
    const boxValue = await getCollateralBoxValue(
      BigInt(collateralAssetId),
      appClient,
      BigInt(appId)
    );
    console.log("box value appId", boxValue.boxRef.appIndex);
    console.log("box value name", boxValue.boxRef.name);

    const result = await appClient
      .newGroup()
      .gas({ args: [], maxFee: AlgoAmount.MicroAlgos(250_000) })
      .borrow({
        args: [
          collateralAxferTxn,
          upscaledBorrowAmount,
          upscaledCollateralAmount,
          lstAppId,
          collateralAssetId,
          mbrTxn,
        ],
        assetReferences: [BigInt(collateralAssetId)],
        appReferences: [BigInt(lstAppId), BigInt(oracleAppId)],
        boxReferences: [
          {
            appId: boxValue.boxRef.appIndex as bigint,
            name: boxValue.boxRef.name,
          },
        ],
        sender: address,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      })
      .send({
        suppressLog: false,
        coverAppCallInnerTransactionFees: true,
      });

    return result.txIds[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function repayDebtAsa({
  address,
  amount,
  appId,
  lstTokenId,
  repayTokenId,
  signer,
}: RepayDebtAsaParams) {
  try {
    const appClient = await getExistingClientAsa(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = amount * 10 ** 6;

    const repayTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: address,
      receiver: appClient.appAddress,
      assetId: BigInt(repayTokenId),
      amount: BigInt(upscaledAmount),
      note: "Repaying debt",
    });

    const result = await appClient
      .newGroup()
      .repayLoanAsa({
        args: [repayTxn, upscaledAmount],
        assetReferences: [BigInt(lstTokenId), BigInt(repayTokenId)],
        appReferences: [appClient.appId],
        sender: address,
      })
      .send({
        suppressLog: false,
        populateAppCallResources: true,
      });
    return result.txIds[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function repayDebtAlgo({
  address,
  amount,
  appId,
  lstTokenId,
  signer,
}: RepayDebtAlgoParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = amount * 10 ** 6;

    const repayTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(upscaledAmount),
      note: "Repaying debt",
    });

    const result = await appClient
      .newGroup()
      .repayLoanAlgo({
        args: [repayTxn, upscaledAmount],
        assetReferences: [BigInt(lstTokenId)],
        appReferences: [appClient.appId],
        sender: address,
      })
      .send({
        suppressLog: false,
        populateAppCallResources: true,
      });
    return result.txIds[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function withdrawCollateral({
  address,
  amount,
  appId,
  collateralAssetId,
  lstAppId,
  signer,
}: WithdrawCollateralParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = amount * 10 ** 6;

    const result = await appClient
      .newGroup()
      .gas()
      .withdrawCollateral({
        args: [upscaledAmount, collateralAssetId, lstAppId],
        assetReferences: [BigInt(collateralAssetId)],
        appReferences: [BigInt(lstAppId)],
        sender: address,
      })
      .send({
        suppressLog: false,
        populateAppCallResources: true,
      });
    return result.txIds[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getLoanRecordBoxValue({
  address,
  appId,
  signer,
}: getLoanRecordParams): Promise<getLoanRecordReturnType> {
  const appClient = await getExistingClient(signer, address, appId);
  appClient.algorand.setDefaultSigner(signer);

  const loanRecordType = new algosdk.ABITupleType([
    new algosdk.ABIAddressType(), // borrowerAddress
    new algosdk.ABIUintType(64), // collateralTokenId
    new algosdk.ABIUintType(64), // collateralAmount
    new algosdk.ABITupleType([
      // struct
      new algosdk.ABIUintType(64), // debtChange amount
      new algosdk.ABIUintType(8), // changeType
      new algosdk.ABIUintType(64), // timestamp
    ]),
    new algosdk.ABIUintType(64), // borrowedTokenId
    new algosdk.ABIUintType(64), // principal
    new algosdk.ABIUintType(64), // userIndexWad
  ]);

  const prefix = new TextEncoder().encode("loan_record");
  const addressBytes = algosdk.decodeAddress(address).publicKey;
  const boxName = new Uint8Array(prefix.length + addressBytes.length);
  boxName.set(prefix, 0);
  boxName.set(addressBytes, prefix.length);

  const value = await appClient.appClient.getBoxValueFromABIType(
    boxName,
    loanRecordType
  );
  const [
    borrowerAddress,
    collateralTokenId,
    collateralAmount,
    lastDebtChange,
    borrowedTokenId,
    principal,
    userIndexWad,
  ] = value as any[];

  return {
    borrowerAddress,
    collateralTokenId,
    collateralAmount,
    lastDebtChange,
    principal,
    borrowedTokenId,
    userIndexWad,
    boxRef: {
      appIndex: appId,
      name: boxName,
    },
  };
}

export async function buyoutSplitASA({
  buyerAddress,
  debtorAddress,
  appId,
  premiumAmount,
  debtRepayAmount,
  xUSDAssetId,
  baseTokenAssetId,
  collateralTokenId,
  lstAppId,
  oracleAppId,
  signer,
}: BuyoutAsaParams) {
  try {
    const appClient = await getExistingClientAsa(signer, buyerAddress, appId);
    appClient.algorand.setDefaultSigner(signer);
    console.log("lstAppId", lstAppId);
    // Scale amounts to micro units
    const upscaledPremiumAmount = premiumAmount * 10 ** 6;
    const upscaledDebtRepayAmount = debtRepayAmount * 10 ** 6;

    const collateralOptInTxn =
      await appClient.algorand.createTransaction.assetOptIn({
        assetId: BigInt(collateralTokenId),
        sender: buyerAddress,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      });

    // Create premium transfer transaction (xUSD)
    const premiumAxferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      assetId: BigInt(xUSDAssetId),
      amount: BigInt(upscaledPremiumAmount),
      note: "Paying buyout premium in xUSD",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    // Create debt repayment transaction (base ASA)
    const repayAxferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      assetId: BigInt(baseTokenAssetId),
      amount: BigInt(upscaledDebtRepayAmount),
      note: "Repaying loan with ASA",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });
    const mbrTxn = appClient.algorand.createTransaction.payment({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(10_000n),
      note: "Funding buyout",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    // Execute the buyout
    const result = await appClient
      .newGroup()
      .addTransaction(collateralOptInTxn)
      .gas({ args: [], note: "1", maxFee: AlgoAmount.MicroAlgos(250_000) })
      .buyoutSplitAsa({
        args: {
          buyer: buyerAddress,
          debtor: debtorAddress,
          premiumAxferTxn: premiumAxferTxn,
          repayAxferTxn: repayAxferTxn,
          lstAppId: BigInt(lstAppId),
          mbrTxn: mbrTxn,
        },
        assetReferences: [
          BigInt(xUSDAssetId),
          BigInt(baseTokenAssetId),
          BigInt(collateralTokenId),
        ],
        appReferences: [BigInt(appId), BigInt(lstAppId), BigInt(oracleAppId)],
        sender: buyerAddress,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      })
      .send({
        suppressLog: false,
        coverAppCallInnerTransactionFees: true,
        populateAppCallResources: true,
      });

    return result.txIds[0];
  } catch (error) {
    console.error("Buyout ASA failed:", error);
    throw error;
  }
}

export async function buyoutSplitAlgo({
  buyerAddress,
  debtorAddress,
  appId,
  premiumAmount,
  debtRepayAmount,
  xUSDAssetId,
  collateralTokenId,
  lstAppId,
  oracleAppId,
  signer,
}: BuyoutAlgoParams) {
  try {
    const appClient = await getExistingClient(signer, buyerAddress, appId);
    appClient.algorand.setDefaultSigner(signer);

    // Scale premium amount to micro units
    const upscaledPremiumAmount = premiumAmount * 10 ** 6;
    // debtRepayAmount is already in microAlgos

    // Create premium transfer transaction (xUSD)
    const premiumAxferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      assetId: BigInt(xUSDAssetId),
      amount: BigInt(upscaledPremiumAmount),
      note: "Paying buyout premium in xUSD",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    // Create debt repayment transaction (ALGO)
    const repayPayTxn = appClient.algorand.createTransaction.payment({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(debtRepayAmount),
      note: "Repaying loan with ALGO",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    const mbrTxn = appClient.algorand.createTransaction.payment({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(10_000n),
      note: "Funding buyout",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });
    // Execute the buyout
    const result = await appClient
      .newGroup()
      .gas({ args: [], note: "1", maxFee: AlgoAmount.MicroAlgos(250_000) })
      .buyoutSplitAlgo({
        args: {
          buyer: buyerAddress,
          debtor: debtorAddress,
          premiumAxferTxn: premiumAxferTxn,
          repayPayTxn: repayPayTxn,
          lstAppId: BigInt(lstAppId),
          mbrTxn: mbrTxn,
        },
        assetReferences: [BigInt(xUSDAssetId), BigInt(collateralTokenId)],
        appReferences: [BigInt(appId), BigInt(lstAppId), BigInt(oracleAppId)],
        sender: buyerAddress,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      })
      .send({
        suppressLog: false,
        coverAppCallInnerTransactionFees: true,
        populateAppCallResources: true,
      });

    return result.txIds[0];
  } catch (error) {
    console.error("Buyout ALGO failed:", error);
    throw error;
  }
}

export async function liquidatePartialAlgo({
  liquidatorAddress,
  debtorAddress,
  appId,
  repayAmount,
  collateralTokenId,
  lstAppId,
  oracleAppId,
  signer,
}: LiquidateAlgoParams) {
  try {
    const appClient = await getExistingClient(signer, liquidatorAddress, appId);
    appClient.algorand.setDefaultSigner(signer);

    // repayAmount is already in microAlgos
    const optInTxn = await appClient.algorand.createTransaction.assetOptIn({
      assetId: BigInt(collateralTokenId),
      sender: liquidatorAddress,
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    // Create debt repayment transaction (ALGO)
    const repayPayTxn = appClient.algorand.createTransaction.payment({
      sender: liquidatorAddress,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(repayAmount),
      note: "Liquidating ALGO debt",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    // Execute the liquidation
    const result = await appClient
      .newGroup()
      .addTransaction(optInTxn)
      .gas({ args: [], note: "1", maxFee: AlgoAmount.MicroAlgos(250_000) })
      .liquidatePartialAlgo({
        args: [
          debtorAddress,
          repayPayTxn,
          BigInt(repayAmount),
          BigInt(lstAppId),
        ],
        assetReferences: [BigInt(collateralTokenId)],
        appReferences: [BigInt(appId), BigInt(lstAppId), BigInt(oracleAppId)],
        sender: liquidatorAddress,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      })
      .send({
        suppressLog: false,
        coverAppCallInnerTransactionFees: true,
        populateAppCallResources: true,
      });

    return result.txIds[0];
  } catch (error) {
    console.error("Liquidate ALGO failed:", error);
    throw error;
  }
}

export async function liquidatePartialASA({
  liquidatorAddress,
  debtorAddress,
  appId,
  repayAmount,
  baseTokenAssetId,
  collateralTokenId,
  lstAppId,
  oracleAppId,
  signer,
}: LiquidateAsaParams) {
  try {
    const appClient = await getExistingClientAsa(
      signer,
      liquidatorAddress,
      appId
    );
    appClient.algorand.setDefaultSigner(signer);

    // Scale amount to micro units
    const upscaledRepayAmount = repayAmount * 10 ** 6;

    const optInTxn = await appClient.algorand.createTransaction.assetOptIn({
      assetId: BigInt(collateralTokenId),
      sender: liquidatorAddress,
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    // Create debt repayment transaction (base ASA)
    const repayAxferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: liquidatorAddress,
      receiver: appClient.appAddress,
      assetId: BigInt(baseTokenAssetId),
      amount: BigInt(upscaledRepayAmount),
      note: "Liquidating ASA debt",
      maxFee: AlgoAmount.MicroAlgos(250_000),
    });

    // Execute the liquidation
    const result = await appClient
      .newGroup()
      .addTransaction(optInTxn)
      .gas({ args: [], note: "1", maxFee: AlgoAmount.MicroAlgos(250_000) })
      .liquidatePartialAsa({
        args: {
          debtor: debtorAddress,
          repayAxfer: repayAxferTxn,
          repayBaseAmount: BigInt(upscaledRepayAmount),
          lstAppId: BigInt(lstAppId),
        },
        assetReferences: [BigInt(baseTokenAssetId), BigInt(collateralTokenId)],
        appReferences: [BigInt(appId), BigInt(lstAppId), BigInt(oracleAppId)],
        sender: liquidatorAddress,
        maxFee: AlgoAmount.MicroAlgos(250_000),
      })
      .send({
        suppressLog: false,
        coverAppCallInnerTransactionFees: true,
        populateAppCallResources: true,
      });

    return result.txIds[0];
  } catch (error) {
    console.error("Liquidate ASA failed:", error);
    throw error;
  }
}
