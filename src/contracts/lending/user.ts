/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { getExistingClient } from "./getClient";
import {
  BorrowParams,
  DepositParams,
  getLoanRecordParams,
  getLoanRecordReturnType,
  RepayDebtAsaParams,
  WithdrawCollateralParams,
  WithdrawParams,
} from "./interface";
import { microAlgo } from "@algorandfoundation/algokit-utils";
import algosdk from "algosdk";
import { getCollateralBoxValue } from "./state";

export async function deposit({
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
    const appClient = await getExistingClient(signer, address, appId);
    appClient.algorand.setDefaultSigner(signer);
    const upscaledAmount = amount * 10 ** 6;

    const repayTxn = appClient.algorand.createTransaction.assetTransfer({
      sender: address,
      receiver: appClient.appAddress,
      assetId: BigInt(repayTokenId),
      amount: BigInt(upscaledAmount),
      note: "Repaying debt",
    });

    await appClient
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

    await appClient
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
    new algosdk.ABIUintType(64), // totalDebt
    new algosdk.ABIUintType(64), // borrowedTokenId
    new algosdk.ABIUintType(64), // lastAccrualTimestamp
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
    totalDebt,
    borrowedTokenId,
    lastAccrualTimestamp,
  ] = value as any[];

  return {
    borrowerAddress,
    collateralTokenId,
    collateralAmount,
    lastDebtChange,
    totalDebt,
    borrowedTokenId,
    lastAccrualTimestamp,
    boxRef: {
      appIndex: appId,
      name: boxName,
    },
  };
}
