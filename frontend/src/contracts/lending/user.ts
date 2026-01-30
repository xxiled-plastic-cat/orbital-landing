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
import algosdk from "algosdk";

const MAX_FEE = AlgoAmount.MicroAlgos(250_000);

export async function depositAsa({
  address,
  amount,
  appId,
  depositAssetId,
  signer,
  lstAssetId,
  baseTokenDecimals,
}: DepositParams) {
  try {
    const appClient = await getExistingClientAsa(signer, address, appId);

    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = Math.floor(amount * 10 ** baseTokenDecimals);

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

    const depositTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: address,
      receiver: appClient.appAddress,
      assetId: BigInt(depositAssetId),
      amount: BigInt(upscaledAmount),
      note: "Depositing " + depositAssetId,
      maxFee: MAX_FEE,
    });

    if (optInRequired) {
      const optInTxn = await appClient.algorand.createTransaction.assetOptIn({
        assetId: BigInt(lstAssetId),
        sender: address,
        maxFee: MAX_FEE,
      });
      group.addTransaction(optInTxn);
    }

    const result = await group
      .depositAsa({
        args: { amount: upscaledAmount, assetTransferTxn: depositTxn },
        sender: address,
        maxFee: MAX_FEE,
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
  signer,
  lstAssetId,
  baseTokenDecimals,
}: DepositParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);

    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = Math.floor(amount * 10 ** baseTokenDecimals);

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

    const depositTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(upscaledAmount),
      note: "Depositing ALGO",
      maxFee: MAX_FEE,
    });

    if (optInRequired) {
      const optInTxn = await appClient.algorand.createTransaction.assetOptIn({
        assetId: BigInt(lstAssetId),
        sender: address,
        maxFee: MAX_FEE,
      });
      group.addTransaction(optInTxn);
    }

    const result = await group
      .depositAlgo({
        args: { depositTxn, amount: upscaledAmount },
        sender: address,
        maxFee: MAX_FEE,
      })
      .send({
        coverAppCallInnerTransactionFees: true,
        populateAppCallResources: true,
        suppressLog: false,
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
  lstTokenDecimals,
}: WithdrawParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = Math.floor(amount * 10 ** lstTokenDecimals);

    const axferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: address,
      receiver: appClient.appAddress,
      assetId: BigInt(lstTokenId),
      amount: BigInt(upscaledAmount),
      note: "Returning lst to contract",
    });


    const result = await appClient.send.withdrawDeposit({
      args: { assetTransferTxn: axferTxn, amount: upscaledAmount },
      sender: address,
      maxFee: MAX_FEE,
      coverAppCallInnerTransactionFees: true,
      populateAppCallResources: true,
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
  appId,
  signer,
  collateralTokenDecimals,
  baseTokenDecimals,
}: BorrowParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledCollateralAmount = Math.floor(collateralAmount * 10 ** collateralTokenDecimals);
    const upscaledBorrowAmount = Math.floor(borrowAmount * 10 ** baseTokenDecimals);

    const collateralAxferTxn =
      appClient.algorand.createTransaction.assetTransfer({
        sender: address,
        receiver: appClient.appAddress,
        assetId: BigInt(collateralAssetId),
        amount: BigInt(upscaledCollateralAmount),
        note: "Depositing collateral: " + collateralAssetId,
        maxFee: MAX_FEE,
      });

    const result = await appClient
      .newGroup()
      .gas({ args: {}, maxFee: MAX_FEE, sender: address })
      .borrow({
        args: {
          assetTransferTxn: collateralAxferTxn,
          requestedLoanAmount: upscaledBorrowAmount,
          collateralAmount: upscaledCollateralAmount,
          collateralTokenId: BigInt(collateralAssetId),
        },
        sender: address,
        maxFee: MAX_FEE,
      })
      .send({
        suppressLog: false,
        coverAppCallInnerTransactionFees: true,
        populateAppCallResources: true,
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
  repayTokenId,
  signer,
  baseTokenDecimals,
}: RepayDebtAsaParams) {
  try {
    const appClient = await getExistingClientAsa(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    // Amount already includes 10,000 micro-units buffer added in frontend
    const upscaledAmount = Math.floor(amount * 10 ** baseTokenDecimals);

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
        args: { assetTransferTxn: repayTxn, repaymentAmount: BigInt(upscaledAmount) },
        sender: address,
        maxFee: MAX_FEE,
      })
      .send({
        suppressLog: false,
        populateAppCallResources: true,
        coverAppCallInnerTransactionFees: true,
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
  signer,
  baseTokenDecimals,
}: RepayDebtAlgoParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    // Amount already includes 10,000 micro-units buffer added in frontend
    const upscaledAmount = Math.floor(amount * 10 ** baseTokenDecimals);

    const repayTxn = appClient.algorand.createTransaction.payment({
      sender: address,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(upscaledAmount),
      note: "Repaying debt",
    });

    const result = await appClient
      .newGroup()
      .repayLoanAlgo({
        args: { paymentTxn: repayTxn, repaymentAmount: BigInt(upscaledAmount) },
        sender: address,
        maxFee: MAX_FEE,
      })
      .send({
        suppressLog: false,
        populateAppCallResources: true,
        coverAppCallInnerTransactionFees: true,
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
  signer,
  lstTokenDecimals,
}: WithdrawCollateralParams) {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = Math.floor(amount * 10 ** lstTokenDecimals);

    // Fetch the accepted collateral record to get the correct lstAppId (market ID)
    const acceptedCollateral = await appClient.state.box.acceptedCollaterals.value({
      assetId: BigInt(collateralAssetId),
    });

    if (!acceptedCollateral) {
      throw new Error(
        `Collateral asset ${collateralAssetId} not found in accepted collaterals`
      );
    }

    // Use the originatingAppId from the collateral record as the lstAppId
    const correctLstAppId = Number(acceptedCollateral.originatingAppId);

    console.log("upscaledAmount", upscaledAmount);
    console.log("collateralAssetId", collateralAssetId);
    console.log("lstAppId (from acceptedCollaterals)", correctLstAppId);

    const result = await appClient
      .newGroup()
      .gas()
      .withdrawCollateral({
        args: { amountLst: upscaledAmount, collateralTokenId: BigInt(collateralAssetId) },
        sender: address,
        maxFee: MAX_FEE,
      })
      .send({
        suppressLog: false,
        populateAppCallResources: true,
        coverAppCallInnerTransactionFees: true,
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
  signer,
  premiumTokenDecimals,
  baseTokenDecimals,
}: BuyoutAsaParams) {
  try {
    const appClient = await getExistingClientAsa(signer, buyerAddress, appId);
    appClient.algorand.setDefaultSigner(signer);
    // Scale amounts to micro units
    const upscaledPremiumAmount = Math.floor(premiumAmount * 10 ** premiumTokenDecimals);
    const upscaledDebtRepayAmount = Math.floor(debtRepayAmount * 10 ** baseTokenDecimals);

    const collateralOptInTxn =
      await appClient.algorand.createTransaction.assetOptIn({
        assetId: BigInt(collateralTokenId),
        sender: buyerAddress,
        maxFee: MAX_FEE,
      });

    // Create premium transfer transaction (xUSD)
    const premiumAxferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      assetId: BigInt(xUSDAssetId),
      amount: BigInt(upscaledPremiumAmount),
      note: "Paying buyout premium in xUSD",
      maxFee: MAX_FEE,
    });

    // Create debt repayment transaction (base ASA)
    const repayAxferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      assetId: BigInt(baseTokenAssetId),
      amount: BigInt(upscaledDebtRepayAmount),
      note: "Repaying loan with ASA",
      maxFee: MAX_FEE,
    });


    // Execute the buyout
    const result = await appClient
      .newGroup()
      .addTransaction(collateralOptInTxn)
      .gas({ args: {}, maxFee: MAX_FEE, sender: buyerAddress })
      .buyoutSplitAsa({
        args: {
          buyer: buyerAddress,
          debtor: debtorAddress,
          premiumAxferTxn: premiumAxferTxn,
          repayAxferTxn: repayAxferTxn,
        },

        sender: buyerAddress,
        maxFee: MAX_FEE,
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
  signer,
  premiumTokenDecimals,
}: BuyoutAlgoParams) {
  try {
    const appClient = await getExistingClient(signer, buyerAddress, appId);
    appClient.algorand.setDefaultSigner(signer);

    // Scale premium amount to micro units
    const upscaledPremiumAmount = Math.floor(premiumAmount * 10 ** premiumTokenDecimals);
    // debtRepayAmount is already in microAlgos

    // Create premium transfer transaction (xUSD)
    const premiumAxferTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      assetId: BigInt(xUSDAssetId),
      amount: BigInt(upscaledPremiumAmount),
      note: "Paying buyout premium in xUSD",
      maxFee: MAX_FEE,
    });

    // Create debt repayment transaction (ALGO)
    const repayPayTxn = appClient.algorand.createTransaction.payment({
      sender: buyerAddress,
      receiver: appClient.appAddress,
      amount: AlgoAmount.MicroAlgos(debtRepayAmount),
      note: "Repaying loan with ALGO",
      maxFee: MAX_FEE,
    });


    // Execute the buyout
    const result = await appClient
      .newGroup()
      .gas({ args: {}, maxFee: MAX_FEE, sender: buyerAddress })
      .buyoutSplitAlgo({
        args: {
          buyer: buyerAddress,
          debtor: debtorAddress,
          premiumAxferTxn: premiumAxferTxn,
          repayPayTxn: repayPayTxn,
        },
        sender: buyerAddress,
        maxFee: MAX_FEE,
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
      .gas({ args: {}, maxFee: MAX_FEE, sender: liquidatorAddress })
      .liquidatePartialAlgo({
        args: {
          debtor: debtorAddress,
          repayPay: repayPayTxn,
          repayBaseAmount: BigInt(repayAmount),
          lstAppId: BigInt(lstAppId),
        },
        sender: liquidatorAddress,
        maxFee: MAX_FEE,
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
  signer,
  baseTokenDecimals,
}: LiquidateAsaParams) {
  try {
    const appClient = await getExistingClientAsa(
      signer,
      liquidatorAddress,
      appId
    );
    appClient.algorand.setDefaultSigner(signer);

    // Scale amount to micro units
    const upscaledRepayAmount = Math.floor(repayAmount * 10 ** baseTokenDecimals);

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
      .gas({ args: {}, maxFee: MAX_FEE, sender: liquidatorAddress })
      .liquidatePartialAsa({
        args: {
          debtor: debtorAddress,
          repayAxfer: repayAxferTxn,
          repayBaseAmount: BigInt(upscaledRepayAmount),
          lstAppId: BigInt(lstAppId),
        },
        sender: liquidatorAddress,
        maxFee: MAX_FEE,
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
