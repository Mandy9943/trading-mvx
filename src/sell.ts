import BigNumber from "bignumber.js";
import {
  fetchTokenBalanceByAccount,
  fetchXexchangePairs,
  retryAsyncFunction,
} from "./services/api";
import { tradeToken } from "./services/blochain-oprations";
import { ShardType } from "./services/types";
import { error, info } from "./utils/notify";

const targetToken = "TOM-48414f";
export const sellToken = async (shard: ShardType): Promise<boolean> => {
  const pairs = await fetchXexchangePairs();
  const pair = pairs.find((pair) => pair.firstToken.identifier === targetToken);
  if (!pair) {
    error(`SELLING: No pair found for token ${targetToken}`);
    return false;
  }

  const tokenBalance = await retryAsyncFunction(fetchTokenBalanceByAccount, [
    pair.firstToken.identifier,
    shard,
  ]);
  // if the token balance is less

  if (!tokenBalance) {
    error(`BUYING: No balance found for token ${pair.firstToken.identifier}`);

    return false;
  }

  const amountToPay = new BigNumber(tokenBalance.balance).times(0.99);

  try {
    info(
      `Selling ${amountToPay
        .dividedBy(10 ** pair.firstToken.decimals)
        .toLocaleString()} ${pair.firstToken.identifier}`
    );
    const txResult = await retryAsyncFunction(
      tradeToken,
      [
        {
          // fix amount to pay
          amountToPay: amountToPay.toNumber(),
          tokenToPay: pair.firstToken.identifier,
          tokenToBuy: pair.secondToken.identifier,
          minAmountToBuy: new BigNumber(1).toNumber(),
          scAddress: pair.address,
          shard: shard,
        },
      ],
      5
    );

    info(
      `Selling ${amountToPay
        .dividedBy(10 ** pair.firstToken.decimals)
        .toFixed()} ${pair.firstToken.identifier}) del token para el par <${
        pair.firstToken.ticker
      } | ${pair.secondToken.ticker}>` +
        "\n" +
        `Sell order for : ${amountToPay
          .dividedBy(10 ** pair.firstToken.decimals)
          .toFixed()} ${pair.firstToken.identifier}\nURL: ${
          txResult.explorerUrl
        }`
    );
    return true;
  } catch (error) {
    return false;
  }
};

sellToken(0);
