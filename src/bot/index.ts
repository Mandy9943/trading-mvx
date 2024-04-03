import BigNumber from "bignumber.js";
import config from "../config";
import {
  fetchTokenBalanceByAccount,
  fetchXechangePair,
  fetchXexchangePairs,
} from "../services/api";
import { tradeToken } from "../services/blochain-oprations";
import { IPair, ShardType } from "../services/types";
import logger from "../utils/logger";
import { error, info } from "../utils/notify";
import storage from "../utils/storage";

export const trade = async (shard: ShardType) => {
  const pairs = await fetchXexchangePairs();

  // Filter pairs that are active and have a minimum liquidity locked
  const notSwappedPairs = pairs.filter(
    (pair) =>
      pair.state === "PartialActive" &&
      Number(pair.secondTokenLockedValueUSD) > config.minLiquidityLockedUSD
  );

  //compare this pairs with the one in the database
  const oldPairs = await storage.readPools();

  // if the pair is in database and is not in the new pairs means that the pair is now enabled to swap so we get the pair
  const newPairs = oldPairs.filter((oldPair) => {
    const found = notSwappedPairs.find(
      (pair) => pair.address === oldPair.address
    );
    return !found;
  });

  if (newPairs.length !== 0) {
    const operatingPair = newPairs[0];
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

  // Update the database with the new pairs
  await storage.writePools(notSwappedPairs);
};

let sellConditionMet = false;

const buyToken = async (pair: IPair, shard: ShardType): Promise<boolean> => {
  const tokenBalance = await fetchTokenBalanceByAccount(
    pair.secondToken.identifier,
    shard
  );
  // if the token balance is less

  if (!tokenBalance) {
    error(`BUYING: No balance found for token ${pair.secondToken.identifier}`);

    return false;
  }

  await tradeToken({
    amountToPay: new BigNumber(tokenBalance.balance).toNumber(),
    tokenToPay: pair.secondToken.identifier,
    tokenToBuy: pair.firstToken.identifier,
    minAmountToBuy: new BigNumber(1)
      .times(10 ** pair.firstToken.decimals)
      .toNumber(),
    scAddress: pair.address,
    shard: shard,
  });

  return true;
};
const sellToken = async (
  pair: IPair,
  shard: ShardType,
  percentage: number = 100
) => {
  info(
    `Vendiendo ${percentage}% del token para el par <${pair.firstToken.ticker} | ${pair.secondToken.ticker}>`
  );
  // Lógica para vender el token

  const tokenBalance = await fetchTokenBalanceByAccount(
    pair.secondToken.identifier,
    shard
  );

  if (!tokenBalance) {
    error(`SELLING: No balance found for token ${pair.secondToken.identifier}`);
    return;
  }

  await tradeToken({
    amountToPay: new BigNumber(tokenBalance.balance)
      .times(percentage)
      .div(100)
      .toNumber(),
    tokenToPay: pair.firstToken.identifier,
    tokenToBuy: pair.secondToken.identifier,
    minAmountToBuy: new BigNumber(1)
      .times(10 ** pair.secondToken.decimals)
      .toNumber(),
    scAddress: pair.address,
    shard: shard,
  });
  if (percentage === 100) {
    sellConditionMet = true; // Marcamos que la condición de venta se ha cumplido
  }
};

const operate = async (pair: IPair, shard: ShardType) => {
  storage.updateData({
    operation: true,
  });

  await buyToken(pair, shard);

  sellConditionMet = false; // Reiniciar la condición de venta para cada operación
  const buyPrice: number = Number(pair.firstTokenPriceUSD);

  // Suponer que la función para verificar el precio actual del token está implementada
  const checkPriceAndSell = async () => {
    const newPair = await fetchXechangePair(pair.address);
    const currentPrice = Number(newPair.firstTokenPriceUSD); // Necesitarías implementar esta función
    if (currentPrice >= buyPrice * 10 && !sellConditionMet) {
      await sellToken(pair, shard); // Vende si el precio es x10 y no se ha vendido todavía
    }
  };

  // Verificar cada X tiempo si el precio ha alcanzado x10
  const priceCheckInterval = setInterval(checkPriceAndSell, 10000); // Revisa cada 10 segundos

  // Esperar 1 minuto y vender el 70% si aún no se ha vendido
  setTimeout(async () => {
    if (!sellConditionMet) {
      await sellToken(pair, shard, 70);
    }
  }, 60000); // 1 minuto

  // Esperar 5 minutos y vender el resto si aún no se ha vendido
  setTimeout(async () => {
    if (!sellConditionMet) {
      await sellToken(pair, shard); // Vende el 100% por defecto
    }
    clearInterval(priceCheckInterval); // Limpia el intervalo de revisión de precio
  }, 300000); // 5 minutos
};
