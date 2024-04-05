import BigNumber from "bignumber.js";
import config from "../config";
import {
  fetchTokenBalanceByAccount,
  fetchXechangePair,
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
  // Filter pairs that are active and have a minimum liquidity locked
  const notSwappedPairs = pairs.filter(
    (pair) =>
      pair.state === "PartialActive" &&
      Number(pair.secondTokenLockedValueUSD) > config.minLiquidityLockedUSD &&
      !config.blackList.includes(pair.firstToken.identifier)
  );

  //compare this pairs with the one in the database
  const oldPairs = (await poolStorage.readData()).pools || [];

  // if the pair is in database and is not in the new pairs means that the pair is now enabled to swap so we get the pair
  const newPairs = oldPairs.filter((oldPair) => {
    const found = notSwappedPairs.find(
      (pair) => pair.address === oldPair.address
    );
    return !found;
  });

  const newPairsWithUpdatedInfo = newPairs.map((newPair) => {
    const found = pairs.find((pair) => pair.address === newPair.address);
    return found;
  });

  if (newPairsWithUpdatedInfo.length !== 0) {
    const operatingPair = newPairsWithUpdatedInfo[0];
    if (operatingPair) {
      if (operatingPair.state === "Active") {
        info(
          `New pool have enable swaps <${operatingPair.firstToken.ticker} | ${
            operatingPair.secondToken.ticker
          }> - ${new Date().toLocaleString()}`
        );

        operate(operatingPair, shard);
      } else {
        info(
          `This pool change but do not allow swaps <${
            operatingPair.firstToken.ticker
          } | ${
            operatingPair.secondToken.ticker
          }> - ${new Date().toLocaleString()}`
        );
      }
    } else {
      logger.info(
        `No new pairs to swap yet. Waiting for ${notSwappedPairs
          .map((p) => `${p.firstToken.ticker}`)
          .join(", ")}`
      );
    }
  } else {
    const newPoolsNoSwapper = notSwappedPairs.filter((oldPair) => {
      const found = oldPairs.find((pair) => pair.address === oldPair.address);
      return !found;
    });

    const newPool = newPoolsNoSwapper[0];
    if (newPoolsNoSwapper.length > 0 && newPool) {
      info(
        `Se acaba de crear un pool <${newPool.firstToken.ticker} - ${newPool.secondToken.ticker}>\nPool URL: https://explorer.multiversx.com/accounts/${newPool.address}\nToken : ${newPool.firstToken.identifier}`
      );
    }

    logger.info(
      `No new pairs to swap yet. Waiting for ${notSwappedPairs
        .map((p) => `${p.firstToken.identifier}`)
        .join(", ")}`
    );
  }

  // Update the database with the new pairs
  await poolStorage.updateData({
    pools: notSwappedPairs,
  });
};

let sellConditionMet = false;

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
    .times(config.buyPercent)
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
const sellToken = async (
  pair: IPair,
  shard: ShardType,
  percentage: number = 100
) => {
  // Lógica para vender el token

  const tokenBalance = await retryAsyncFunction(fetchTokenBalanceByAccount, [
    pair.firstToken.identifier,
    shard,
  ]);

  if (!tokenBalance) {
    error(`SELLING: No balance found for token ${pair.firstToken.identifier}`);
    return;
  }

  const amountToPay = new BigNumber(tokenBalance.balance)
    .times(0.98)
    .times(percentage)
    .div(100);

  const txResult = await retryAsyncFunction(
    tradeToken,
    [
      {
        amountToPay: amountToPay.toNumber(),
        tokenToPay: pair.firstToken.identifier,
        tokenToBuy: pair.secondToken.identifier,
        minAmountToBuy: new BigNumber(1).toNumber(),
        scAddress: pair.address,
        shard: shard,
      },
    ],
    10
  );

  info(
    `Vendiendo ${percentage}% del token para el par <${pair.firstToken.ticker} | ${pair.secondToken.ticker}>` +
      "\n" +
      `Have been sell ${amountToPay
        .dividedBy(10 ** pair.firstToken.decimals)
        .toNumber()
        .toLocaleString()} ${pair.firstToken.identifier}\nURL: ${
        txResult.explorerUrl
      }`
  );

  if (percentage === 100) {
    sellConditionMet = true; // Marcamos que la condición de venta se ha cumplido

    operationStorage.updateData({
      operation: false,
    });
  }
};

const operate = async (pair: IPair, shard: ShardType) => {
  logger.info("Start Operating...");
  operationStorage.updateData({
    operation: true,
  });

  logger.info("Buying token...");

  const successFullBuy = await buyToken(pair, shard);

  if (successFullBuy) {
    sellConditionMet = false; // Reiniciar la condición de venta para cada operación
    const buyPrice: number = Number(pair.firstTokenPriceUSD);

    // Suponer que la función para verificar el precio actual del token está implementada
    const checkPriceAndSell = async () => {
      const newPair = await fetchXechangePair(pair.address);

      const currentPrice = Number(newPair.firstTokenPriceUSD); // Necesitarías implementar esta función

      if (currentPrice >= buyPrice * config.maxProfit && !sellConditionMet) {
        logger.info("Buy price: $" + buyPrice);
        logger.info("Current Price: $" + currentPrice);
        logger.info("Required price: $" + buyPrice * config.maxProfit);
        console.log("\n");
        info("Max profit meet with the price :" + currentPrice);
        await sellToken(pair, shard); // Vende si el precio es x10 y no se ha vendido todavía
      }
    };

    logger.info("Checking price and selling if necessary...");
    // Verificar cada X tiempo si el precio ha alcanzado x10
    const priceCheckInterval = setInterval(
      checkPriceAndSell,
      config.timeToCheckMaxProfit
    );

    // Esperar minuto y vender el 100% si aún no se ha vendido
    setTimeout(async () => {
      if (!sellConditionMet) {
        await sellToken(pair, shard, config.percentFirstSell);
      }
    }, config.timeForFirstSell);

    // Esperar 5 minutos y vender el resto si aún no se ha vendido
    setTimeout(async () => {
      if (!sellConditionMet) {
        await sellToken(pair, shard); // Vende el 100% por defecto
      }
      clearInterval(priceCheckInterval); // Limpia el intervalo de revisión de precio
    }, config.timeForSecondSell); // 5 minutos
  }
};
