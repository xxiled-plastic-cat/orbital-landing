// src/utils/calculations.ts
function utilNormBps(totalDeposits, totalBorrows, utilCapBps) {
  if (totalDeposits === 0n) return 0n;
  const utilBps = totalBorrows * 10000n / totalDeposits;
  if (utilBps > utilCapBps) return utilCapBps;
  return utilBps * 10000n / utilCapBps;
}
function aprBpsKinked(U_norm_bps, params) {
  let apr = params.base_bps;
  if (U_norm_bps <= params.kink_norm_bps) {
    apr = apr + params.slope1_bps * U_norm_bps / 10000n;
  } else {
    const aprAtKink = params.base_bps + params.slope1_bps * params.kink_norm_bps / 10000n;
    const excessUtil = U_norm_bps - params.kink_norm_bps;
    apr = aprAtKink + params.slope2_bps * excessUtil / 10000n;
  }
  if (apr > params.max_apr_bps) {
    apr = params.max_apr_bps;
  }
  return apr;
}
function currentAprBps(state) {
  const U_norm_bps = utilNormBps(
    state.totalDeposits,
    state.totalBorrows,
    state.util_cap_bps
  );
  let apr_bps;
  if (state.rate_model_type === 0n) {
    apr_bps = aprBpsKinked(U_norm_bps, {
      base_bps: state.base_bps,
      kink_norm_bps: state.kink_norm_bps,
      slope1_bps: state.slope1_bps,
      slope2_bps: state.slope2_bps,
      max_apr_bps: state.max_apr_bps
    });
  } else {
    apr_bps = state.base_bps;
  }
  return { apr_bps, util_norm_bps: U_norm_bps };
}
function calculateLSTDue(amountIn, circulatingLST, totalDeposits) {
  if (totalDeposits === 0n) {
    return amountIn;
  }
  const lstDue = amountIn * circulatingLST / totalDeposits;
  return lstDue;
}
function calculateAssetDue(lstAmount, circulatingLST, totalDeposits) {
  if (circulatingLST === 0n) {
    return 0n;
  }
  const assetDue = lstAmount * totalDeposits / circulatingLST;
  return assetDue;
}
function calculateLSTPrice(circulatingLST, totalDeposits) {
  if (circulatingLST === 0n) {
    return 1;
  }
  const price = Number(totalDeposits) / Number(circulatingLST);
  return price;
}
function microToStandard(amount, decimals) {
  return Number(amount) / Math.pow(10, decimals);
}
function standardToMicro(amount, decimals) {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

// src/utils/state.ts
import algosdk from "algosdk";
async function getApplicationGlobalState(algodClient, appId) {
  const app = await algodClient.getApplicationByID(appId).do();
  const globalState = app.params["global-state"] || [];
  const state = {};
  for (const item of globalState) {
    const key = Buffer.from(item.key, "base64").toString("utf8");
    const value = item.value;
    if (value.type === 1) {
      state[key] = Buffer.from(value.bytes, "base64");
      if (value.bytes && Buffer.from(value.bytes, "base64").length === 32) {
        try {
          state[key] = algosdk.encodeAddress(Buffer.from(value.bytes, "base64"));
        } catch {
          state[key] = Buffer.from(value.bytes, "base64");
        }
      }
    } else if (value.type === 2) {
      state[key] = BigInt(value.uint);
    }
  }
  return state;
}
async function getBoxValue(algodClient, appId, boxName) {
  const boxResponse = await algodClient.getApplicationBoxByName(appId, boxName).do();
  return new Uint8Array(boxResponse.value);
}
function decodeDepositRecord(boxValue) {
  const depositRecordType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64),
    // assetId
    new algosdk.ABIUintType(64)
    // depositAmount
  ]);
  const decoded = depositRecordType.decode(boxValue);
  return {
    assetId: decoded[0],
    depositAmount: decoded[1]
  };
}
function decodeLoanRecord(boxValue) {
  const loanRecordType = new algosdk.ABITupleType([
    new algosdk.ABIAddressType(),
    // borrowerAddress
    new algosdk.ABIUintType(64),
    // collateralTokenId
    new algosdk.ABIUintType(64),
    // collateralAmount
    new algosdk.ABITupleType([
      new algosdk.ABIUintType(64),
      // lastDebtChange.amount
      new algosdk.ABIUintType(8),
      // lastDebtChange.changeType
      new algosdk.ABIUintType(64)
      // lastDebtChange.timestamp
    ]),
    new algosdk.ABIUintType(64),
    // borrowedTokenId
    new algosdk.ABIUintType(64),
    // principal
    new algosdk.ABIUintType(64)
    // userIndexWad
  ]);
  const decoded = loanRecordType.decode(boxValue);
  const borrowerAddressRaw = decoded[0];
  const borrowerAddress = typeof borrowerAddressRaw === "string" ? borrowerAddressRaw : algosdk.encodeAddress(borrowerAddressRaw);
  const lastDebtChange = decoded[3];
  return {
    borrowerAddress,
    collateralTokenId: decoded[1],
    collateralAmount: decoded[2],
    lastDebtChange: {
      amount: lastDebtChange[0],
      changeType: Number(lastDebtChange[1]),
      timestamp: lastDebtChange[2]
    },
    borrowedTokenId: decoded[4],
    principal: decoded[5],
    userIndexWad: decoded[6]
  };
}
function createDepositBoxName(userAddress, assetId) {
  const depositKeyType = new algosdk.ABITupleType([
    new algosdk.ABIAddressType(),
    new algosdk.ABIUintType(64)
    // assetId
  ]);
  const prefix = new TextEncoder().encode("deposit_record");
  const encodedKey = depositKeyType.encode([
    algosdk.decodeAddress(userAddress).publicKey,
    assetId
  ]);
  return new Uint8Array([...prefix, ...encodedKey]);
}
function createLoanBoxName(userAddress) {
  const prefix = new TextEncoder().encode("loan_record");
  const addressBytes = algosdk.decodeAddress(userAddress).publicKey;
  return new Uint8Array([...prefix, ...addressBytes]);
}
function decodeOraclePrice(boxValue) {
  const oraclePriceType = new algosdk.ABITupleType([
    new algosdk.ABIUintType(64),
    // assetId
    new algosdk.ABIUintType(64),
    // price
    new algosdk.ABIUintType(64)
    // lastUpdated
  ]);
  const decoded = oraclePriceType.decode(boxValue);
  return {
    assetId: decoded[0],
    price: decoded[1],
    lastUpdated: decoded[2]
  };
}
function createOraclePriceBoxName(assetId) {
  const prefix = new TextEncoder().encode("prices");
  const assetIdBytes = new Uint8Array(8);
  const view = new DataView(assetIdBytes.buffer);
  view.setBigUint64(0, BigInt(assetId), false);
  return new Uint8Array([...prefix, ...assetIdBytes]);
}

// src/utils/api.ts
var DEFAULT_API_BASE_URL = "https://api.orbitalfinance.io";
async function fetchMarketList(network, apiBaseUrl = DEFAULT_API_BASE_URL) {
  try {
    const response = await fetch(`${apiBaseUrl}/orbital/markets`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const markets = await response.json();
    return markets.filter((m) => m.network === network);
  } catch (error) {
    console.error("Failed to fetch market list from API:", error);
    throw new Error("Failed to fetch market list from Orbital API");
  }
}
async function fetchMarketInfo(appId, apiBaseUrl = DEFAULT_API_BASE_URL) {
  try {
    const response = await fetch(`${apiBaseUrl}/orbital/markets/${appId}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch market info for ${appId}:`, error);
    throw new Error(`Failed to fetch market info for ${appId}`);
  }
}

// src/client.ts
var OrbitalSDK = class {
  constructor(config) {
    this.algodClient = config.algodClient;
    this.network = config.network;
    this.apiBaseUrl = config.apiBaseUrl || "https://api.orbitalfinance.io";
  }
  /**
   * Get comprehensive market data for a lending market
   * @param appId Application ID of the lending market
   * @returns Formatted market data
   */
  async getMarket(appId) {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );
    const baseTokenId = Number(globalState.base_token_id || 0n);
    const lstTokenId = Number(globalState.lst_token_id || 0n);
    const oracleAppId = Number(globalState.oracle_app || 0n);
    const buyoutTokenId = Number(globalState.buyout_token_id || 0n);
    const totalDeposits = globalState.total_deposits || 0n;
    const totalBorrows = globalState.total_borrows || 0n;
    const circulatingLST = globalState.circulating_lst || 0n;
    const borrowIndexWad = globalState.borrow_index_wad || 0n;
    const lastUpdate = Number(globalState.last_update || 0n);
    const baseBps = globalState.base_bps || 200n;
    const utilCapBps = globalState.util_cap_bps || 10000n;
    const kinkNormBps = globalState.kink_norm_bps || 5000n;
    const slope1Bps = globalState.slope1_bps || 1000n;
    const slope2Bps = globalState.slope2_bps || 4000n;
    const maxAprBps = globalState.max_apr_bps || 60000n;
    const rateModelType = globalState.rate_model_type || 0n;
    const protocolShareBps = globalState.protocol_share_bps || 500n;
    const originationFeeBps = globalState.origination_fee_bps || 0n;
    const liqBonusBps = globalState.liq_bonus_bps || 750n;
    const contractState = Number(globalState.contract_state || 1n);
    const baseTokenDecimals = baseTokenId === 0 ? 6 : 6;
    const lstTokenDecimals = baseTokenDecimals;
    const aprData = currentAprBps({
      totalDeposits,
      totalBorrows,
      base_bps: baseBps,
      util_cap_bps: utilCapBps,
      kink_norm_bps: kinkNormBps,
      slope1_bps: slope1Bps,
      slope2_bps: slope2Bps,
      max_apr_bps: maxAprBps,
      rate_model_type: rateModelType
    });
    const borrowAprBps = aprData.apr_bps;
    const utilNormBps2 = aprData.util_norm_bps;
    const borrowApy = Number(borrowAprBps) / 100;
    const utilizationRate = Number(utilNormBps2) / 100;
    const netUtilization = utilizationRate / 100;
    const feeMultiplier = 1 - Number(protocolShareBps) / 1e4;
    const supplyApy = borrowApy * netUtilization * feeMultiplier;
    const capBorrow = Number(totalDeposits) * Number(utilCapBps) / 1e4;
    const currentBorrows = Number(totalBorrows);
    const availableToBorrow = Math.max(0, capBorrow - currentBorrows);
    const totalDepositsStd = microToStandard(totalDeposits, baseTokenDecimals);
    const totalBorrowsStd = microToStandard(totalBorrows, baseTokenDecimals);
    const availableToBorrowStd = microToStandard(
      BigInt(Math.floor(availableToBorrow)),
      baseTokenDecimals
    );
    const circulatingLSTStd = microToStandard(circulatingLST, lstTokenDecimals);
    const baseTokenPrice = 1;
    return {
      appId,
      baseTokenId,
      lstTokenId,
      oracleAppId,
      buyoutTokenId,
      supplyApy,
      borrowApy,
      utilizationRate,
      totalDeposits: totalDepositsStd,
      totalBorrows: totalBorrowsStd,
      availableToBorrow: availableToBorrowStd,
      circulatingLST: circulatingLSTStd,
      baseTokenPrice,
      totalDepositsUSD: totalDepositsStd * baseTokenPrice,
      totalBorrowsUSD: totalBorrowsStd * baseTokenPrice,
      availableToBorrowUSD: availableToBorrowStd * baseTokenPrice,
      // Default LTV and liquidation threshold - should be fetched from contract
      ltv: 7500,
      // 75%
      liquidationThreshold: 8500,
      // 85%
      liqBonusBps: Number(liqBonusBps),
      originationFeeBps: Number(originationFeeBps),
      baseTokenDecimals,
      lstTokenDecimals,
      rateModel: {
        baseBps: Number(baseBps),
        utilCapBps: Number(utilCapBps),
        kinkNormBps: Number(kinkNormBps),
        slope1Bps: Number(slope1Bps),
        slope2Bps: Number(slope2Bps),
        maxAprBps: Number(maxAprBps),
        rateModelType: Number(rateModelType)
      },
      contractState,
      protocolShareBps: Number(protocolShareBps),
      borrowIndexWad,
      lastUpdateTimestamp: lastUpdate
    };
  }
  /**
   * Get current APY for a market
   * @param appId Application ID of the lending market
   * @returns Supply and borrow APYs
   */
  async getAPY(appId) {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );
    const totalDeposits = globalState.total_deposits || 0n;
    const totalBorrows = globalState.total_borrows || 0n;
    const baseBps = globalState.base_bps || 200n;
    const utilCapBps = globalState.util_cap_bps || 10000n;
    const kinkNormBps = globalState.kink_norm_bps || 5000n;
    const slope1Bps = globalState.slope1_bps || 1000n;
    const slope2Bps = globalState.slope2_bps || 4000n;
    const maxAprBps = globalState.max_apr_bps || 60000n;
    const rateModelType = globalState.rate_model_type || 0n;
    const protocolShareBps = globalState.protocol_share_bps || 500n;
    const aprData = currentAprBps({
      totalDeposits,
      totalBorrows,
      base_bps: baseBps,
      util_cap_bps: utilCapBps,
      kink_norm_bps: kinkNormBps,
      slope1_bps: slope1Bps,
      slope2_bps: slope2Bps,
      max_apr_bps: maxAprBps,
      rate_model_type: rateModelType
    });
    const borrowApy = Number(aprData.apr_bps) / 100;
    const utilizationRate = Number(aprData.util_norm_bps) / 100;
    const netUtilization = utilizationRate / 100;
    const feeMultiplier = 1 - Number(protocolShareBps) / 1e4;
    const supplyApy = borrowApy * netUtilization * feeMultiplier;
    return {
      supplyApy,
      borrowApy,
      utilizationRate,
      utilNormBps: Number(aprData.util_norm_bps)
    };
  }
  /**
   * Get LST token price in terms of underlying asset
   * @param appId Application ID of the lending market
   * @returns LST price information
   */
  async getLSTPrice(appId) {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );
    const totalDeposits = globalState.total_deposits || 0n;
    const circulatingLST = globalState.circulating_lst || 0n;
    const price = calculateLSTPrice(circulatingLST, totalDeposits);
    return {
      price,
      totalDeposits,
      circulatingLST,
      exchangeRate: price
    };
  }
  /**
   * Get user's position in a market
   * @param appId Application ID of the lending market
   * @param userAddress User's Algorand address
   * @returns User position data
   */
  async getUserPosition(appId, userAddress) {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );
    const baseTokenId = globalState.base_token_id || 0n;
    const lstTokenId = globalState.lst_token_id || 0n;
    const baseTokenDecimals = Number(baseTokenId) === 0 ? 6 : 6;
    let depositAmount = 0n;
    try {
      const depositBoxName = createDepositBoxName(userAddress, baseTokenId);
      const depositBoxValue = await getBoxValue(
        this.algodClient,
        appId,
        depositBoxName
      );
      const depositRecord = decodeDepositRecord(depositBoxValue);
      depositAmount = depositRecord.depositAmount;
    } catch (error) {
      console.debug("No deposit record found:", error);
    }
    let lstBalance = 0n;
    try {
      const accountInfo = await this.algodClient.accountInformation(userAddress).do();
      const lstAsset = accountInfo.assets?.find(
        (a) => a["asset-id"] === Number(lstTokenId)
      );
      lstBalance = BigInt(lstAsset?.amount || 0);
    } catch (error) {
      console.debug("Error fetching LST balance:", error);
    }
    let borrowed = 0n;
    let collateral = 0n;
    let collateralAssetId = 0n;
    let userIndexWad = 0n;
    let principal = 0n;
    let lastDebtChange = 0;
    try {
      const loanBoxName = createLoanBoxName(userAddress);
      const loanBoxValue = await getBoxValue(
        this.algodClient,
        appId,
        loanBoxName
      );
      const loanRecord = decodeLoanRecord(loanBoxValue);
      collateralAssetId = loanRecord.collateralTokenId;
      collateral = loanRecord.collateralAmount;
      lastDebtChange = Number(loanRecord.lastDebtChange);
      principal = loanRecord.principal;
      userIndexWad = loanRecord.userIndexWad;
      const currentBorrowIndex = globalState.borrow_index_wad || 0n;
      if (userIndexWad > 0n && currentBorrowIndex > 0n) {
        borrowed = principal * currentBorrowIndex / userIndexWad;
      } else {
        borrowed = principal;
      }
    } catch (error) {
      console.debug("No loan record found:", error);
    }
    const suppliedStd = microToStandard(depositAmount, baseTokenDecimals);
    const lstBalanceStd = microToStandard(lstBalance, baseTokenDecimals);
    const borrowedStd = microToStandard(borrowed, baseTokenDecimals);
    const collateralStd = microToStandard(collateral, baseTokenDecimals);
    const ltv = 0.75;
    const collateralValue = collateralStd;
    const maxBorrowValue = collateralValue * ltv;
    const healthFactor = borrowedStd > 0 ? maxBorrowValue / borrowedStd : Infinity;
    return {
      address: userAddress,
      appId,
      supplied: suppliedStd,
      lstBalance: lstBalanceStd,
      borrowed: borrowedStd,
      collateral: collateralStd,
      collateralAssetId: Number(collateralAssetId),
      userIndexWad,
      principal,
      lastDebtChange,
      healthFactor,
      maxBorrow: maxBorrowValue,
      isLiquidatable: healthFactor < 1
    };
  }
  /**
   * Get raw global state from a market contract
   * @param appId Application ID of the lending market
   * @returns Raw global state
   */
  async getGlobalState(appId) {
    return await getApplicationGlobalState(this.algodClient, appId);
  }
  /**
   * Get the network type being used
   * @returns Network type ('mainnet' or 'testnet')
   */
  getNetwork() {
    return this.network;
  }
  /**
   * Get multiple markets in parallel
   * @param appIds Array of market application IDs
   * @returns Array of market data
   */
  async getMarkets(appIds) {
    const marketPromises = appIds.map(async (appId) => {
      try {
        return await this.getMarket(appId);
      } catch (error) {
        console.warn(`Failed to fetch market ${appId}:`, error);
        return null;
      }
    });
    const results = await Promise.all(marketPromises);
    return results.filter((market) => market !== null);
  }
  /**
   * Get all markets for the current network from the backend API
   * This fetches the market list from Orbital's API and then retrieves on-chain data
   * @returns Array of all available markets
   */
  async getAllMarkets() {
    try {
      const marketInfos = await fetchMarketList(this.network, this.apiBaseUrl);
      console.log(`Found ${marketInfos.length} markets on ${this.network}`);
      const appIds = marketInfos.map((m) => m.appId);
      return await this.getMarkets(appIds);
    } catch (error) {
      console.error("Failed to fetch all markets:", error);
      throw new Error("Failed to fetch all markets");
    }
  }
  /**
   * Get market list (basic info) from backend API without fetching on-chain data
   * This is faster than getAllMarkets() if you only need market IDs and token IDs
   * @returns Array of basic market information
   */
  async getMarketList() {
    try {
      return await fetchMarketList(this.network, this.apiBaseUrl);
    } catch (error) {
      console.error("Failed to fetch market list:", error);
      throw new Error("Failed to fetch market list");
    }
  }
  /**
   * Get price for a single asset from oracle contract
   * @param oracleAppId Oracle application ID
   * @param assetId Asset ID to get price for
   * @returns Oracle price data
   */
  async getOraclePrice(oracleAppId, assetId) {
    try {
      const boxName = createOraclePriceBoxName(assetId);
      const boxValue = await getBoxValue(
        this.algodClient,
        oracleAppId,
        boxName
      );
      const decoded = decodeOraclePrice(boxValue);
      const price = Number(decoded.price) / 1e6;
      const lastUpdated = Number(decoded.lastUpdated);
      return {
        assetId,
        price,
        priceRaw: decoded.price,
        lastUpdated,
        lastUpdatedDate: new Date(lastUpdated * 1e3)
      };
    } catch (error) {
      console.error(
        `Failed to fetch oracle price for asset ${assetId}:`,
        error
      );
      throw new Error(`Failed to fetch oracle price for asset ${assetId}`);
    }
  }
  /**
   * Get prices for multiple assets from oracle contract
   * @param oracleAppId Oracle application ID
   * @param assetIds Array of asset IDs to get prices for
   * @returns Map of asset ID to oracle price data
   */
  async getOraclePrices(oracleAppId, assetIds) {
    const priceMap = /* @__PURE__ */ new Map();
    const pricePromises = assetIds.map(async (assetId) => {
      try {
        const price = await this.getOraclePrice(oracleAppId, assetId);
        return { assetId, price };
      } catch (error) {
        console.warn(`Failed to fetch price for asset ${assetId}:`, error);
        return null;
      }
    });
    const results = await Promise.all(pricePromises);
    results.forEach((result) => {
      if (result) {
        priceMap.set(result.assetId, result.price);
      }
    });
    return priceMap;
  }
  /**
   * Get asset information from Algorand blockchain
   * @param assetId Asset ID to get info for (use 0 for ALGO)
   * @returns Asset information
   */
  async getAssetInfo(assetId) {
    try {
      if (assetId === 0) {
        return {
          id: 0,
          name: "Algorand",
          unitName: "ALGO",
          decimals: 6,
          total: 10000000000000000n,
          // 10 billion ALGO
          frozen: false,
          creator: "",
          url: "https://algorand.com"
        };
      }
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      const params = assetInfo.params;
      return {
        id: assetId,
        name: params.name || "",
        unitName: params["unit-name"] || params.unitName || "",
        url: params.url,
        decimals: params.decimals,
        total: BigInt(params.total),
        frozen: params["default-frozen"] || params.defaultFrozen || false,
        creator: params.creator,
        manager: params.manager,
        reserve: params.reserve,
        freeze: params.freeze,
        clawback: params.clawback
      };
    } catch (error) {
      console.error(`Failed to fetch asset info for ${assetId}:`, error);
      throw new Error(`Failed to fetch asset info for ${assetId}`);
    }
  }
  /**
   * Get information for multiple assets in parallel
   * @param assetIds Array of asset IDs to get info for
   * @returns Array of asset information
   */
  async getAssetsInfo(assetIds) {
    const assetPromises = assetIds.map(async (assetId) => {
      try {
        return await this.getAssetInfo(assetId);
      } catch (error) {
        console.warn(`Failed to fetch asset info for ${assetId}:`, error);
        return null;
      }
    });
    const results = await Promise.all(assetPromises);
    return results.filter((asset) => asset !== null);
  }
  /**
   * Get all loan records for a specific market
   * @param appId Market application ID
   * @returns Array of loan records
   */
  async getMarketLoanRecords(appId) {
    try {
      const boxesResponse = await this.algodClient.getApplicationBoxes(appId).do();
      const boxes = boxesResponse.boxes || [];
      const loanRecords = [];
      const loanRecordPrefix = new TextEncoder().encode("loan_record");
      const loanBoxPromises = boxes.filter((box) => {
        const boxName = Buffer.from(box.name);
        const prefixBuffer = Buffer.from(loanRecordPrefix);
        return boxName.subarray(0, prefixBuffer.length).equals(prefixBuffer);
      }).map(async (box) => {
        try {
          const boxValue = await getBoxValue(
            this.algodClient,
            appId,
            box.name
          );
          const decoded = decodeLoanRecord(boxValue);
          if (!decoded.principal || decoded.principal === 0n) {
            return null;
          }
          return decoded;
        } catch (error) {
          console.warn(`Failed to decode loan record box:`, error);
          return null;
        }
      });
      const results = await Promise.all(loanBoxPromises);
      results.forEach((record) => {
        if (record) {
          loanRecords.push(record);
        }
      });
      return loanRecords;
    } catch (error) {
      console.error(`Failed to fetch loan records for market ${appId}:`, error);
      throw new Error(`Failed to fetch loan records for market ${appId}`);
    }
  }
  /**
   * Get all debt positions across multiple markets
   * @param marketAppIds Array of market application IDs
   * @returns Array of debt positions with calculated metrics
   */
  async getAllDebtPositions(marketAppIds) {
    const allPositions = [];
    const marketPromises = marketAppIds.map(async (appId) => {
      try {
        const loanRecords = await this.getMarketLoanRecords(appId);
        const marketData = await this.getMarket(appId);
        return loanRecords.map((record) => {
          const currentBorrowIndex = marketData.borrowIndexWad;
          let totalDebt = Number(record.principal);
          if (record.userIndexWad > 0n && currentBorrowIndex > 0n) {
            totalDebt = Number(
              record.principal * currentBorrowIndex / record.userIndexWad
            );
          }
          const principal = microToStandard(
            record.principal,
            marketData.baseTokenDecimals
          );
          const totalDebtStd = microToStandard(
            BigInt(Math.floor(totalDebt)),
            marketData.baseTokenDecimals
          );
          const collateralAmount = microToStandard(
            record.collateralAmount,
            marketData.baseTokenDecimals
          );
          const healthRatio = collateralAmount > 0 && totalDebtStd > 0 ? collateralAmount / totalDebtStd : Infinity;
          const position = {
            id: `${record.borrowerAddress}-${appId}`,
            marketId: appId,
            borrowerAddress: record.borrowerAddress,
            collateralTokenId: Number(record.collateralTokenId),
            collateralAmount,
            borrowedTokenId: Number(record.borrowedTokenId),
            principal,
            totalDebt: totalDebtStd,
            userIndexWad: record.userIndexWad,
            healthRatio,
            liquidationThreshold: marketData.liquidationThreshold / 1e4,
            // Convert from bps
            lastUpdated: new Date(
              Number(record.lastDebtChange.timestamp) * 1e3
            )
          };
          return position;
        });
      } catch (error) {
        console.warn(
          `Failed to fetch debt positions for market ${appId}:`,
          error
        );
        return [];
      }
    });
    const results = await Promise.all(marketPromises);
    results.forEach((positions) => {
      allPositions.push(...positions);
    });
    return allPositions;
  }
  /**
   * Get all debt positions across all markets from backend API
   * This is a convenience method that fetches the market list and then gets all positions
   * @returns Array of all debt positions
   */
  async getAllDebtPositionsFromAllMarkets() {
    try {
      const marketList = await this.getMarketList();
      const marketAppIds = marketList.map((m) => m.appId);
      return await this.getAllDebtPositions(marketAppIds);
    } catch (error) {
      console.error("Failed to fetch all debt positions:", error);
      throw new Error("Failed to fetch all debt positions");
    }
  }
};
export {
  OrbitalSDK,
  aprBpsKinked,
  calculateAssetDue,
  calculateLSTDue,
  calculateLSTPrice,
  createDepositBoxName,
  createLoanBoxName,
  createOraclePriceBoxName,
  currentAprBps,
  decodeDepositRecord,
  decodeLoanRecord,
  decodeOraclePrice,
  fetchMarketInfo,
  fetchMarketList,
  getApplicationGlobalState,
  getBoxValue,
  microToStandard,
  standardToMicro,
  utilNormBps
};
