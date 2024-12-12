import BigNumber from "bignumber.js";
import config from "../config";
import {
  fetchTokenBalanceByAccount,
  fetchXexchangePairs,
  retryAsyncFunction,
} from "../services/api";
import { tradeToken } from "../services/blochain-oprations";
import { IPair, ShardType } from "../services/types";
import logger from "../utils/logger";
import { error, info } from "../utils/notify";
import { operationStorage, poolStorage } from "../utils/storage";

let operation = false;
export const trade = async (shard: ShardType) => {
  const pairs = await retryAsyncFunction(fetchXexchangePairs, []);

  // Filter only for TOM-48414f token
  const targetPair = pairs.find(
    (pair) => pair.firstToken.identifier === "TOM-48414f"
  );

  if (targetPair && targetPair.state === "Active") {
    info(
      `TOM-48414f pool is now tradable! <${targetPair.firstToken.ticker} | ${
        targetPair.secondToken.ticker
      }> - ${new Date().toLocaleString()}`
    );
    operate(targetPair, shard);
  } else {
    logger.info("Waiting for TOM-48414f pool to become tradable...");
  }

  // Update the database with the current pair state
  await poolStorage.updateData({
    pools: targetPair ? [targetPair] : [],
  });
};

export const buyToken = async (
  pair: IPair,
  shard: ShardType
): Promise<boolean> => {
  logger.info(
    `Fetching token balance for token ${pair.secondToken.identifier}...`
  );

  const tokenBalance = await retryAsyncFunction(fetchTokenBalanceByAccount, [
    pair.secondToken.identifier,
    shard,
  ]);
  // if the token balance is less

  if (!tokenBalance) {
    error(`BUYING: No balance found for token ${pair.secondToken.identifier}`);

    return false;
  }

  const amountToPay = new BigNumber(tokenBalance.balance)
    .times(config.buyPercent === 100 ? 99 : config.buyPercent)
    .dividedBy(100);

  try {
    const txResult = await retryAsyncFunction(
      tradeToken,
      [
        {
          // fix amount to pay
          amountToPay: amountToPay.toNumber(),
          tokenToPay: pair.secondToken.identifier,
          tokenToBuy: pair.firstToken.identifier,
          minAmountToBuy: new BigNumber(1).toNumber(),
          scAddress: pair.address,
          shard: shard,
        },
      ],
      5
    );

    info(
      `Comprando ${config.buyPercent}% (${amountToPay
        .dividedBy(10 ** pair.secondToken.decimals)
        .toNumber()
        .toLocaleString()} ${
        pair.secondToken.identifier
      }) del token para el par <${pair.firstToken.ticker} | ${
        pair.secondToken.ticker
      }>` +
        "\n" +
        `Buy order for : ${amountToPay
          .dividedBy(10 ** pair.secondToken.decimals)
          .toNumber()
          .toLocaleString()} ${pair.secondToken.identifier}\nURL: ${
          txResult.explorerUrl
        }`
    );
    return true;
  } catch (error) {
    return false;
  }
};

const operate = async (pair: IPair, shard: ShardType) => {
  logger.info("Start Operating...");
  operationStorage.updateData({
    operation: true,
  });

  logger.info("Buying TOM-48414f token...");
  const successFullBuy = await buyToken(pair, shard);

  if (successFullBuy) {
    info("Successfully bought TOM-48414f token - HOLDING position");
    // No selling logic needed as we want to hold
  } else {
    operationStorage.updateData({
      operation: false,
    });
  }
};
