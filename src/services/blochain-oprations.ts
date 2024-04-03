import { e, envChain, World } from "xsuite";

import config from "../config";
import { wrapEgldContract } from "../config/network";
import { ShardType } from "./types";

const world = World.new({
  chainId: envChain.id(),
});

export const walletShard0 = () =>
  world.newWalletFromFile_unsafe(
    "wallets/shard0.json",
    config.walletFilePassword
  );

export const walletShard1 = () =>
  world.newWalletFromFile_unsafe(
    "wallets/shard1.json",
    config.walletFilePassword
  );

export const walletShard2 = () =>
  world.newWalletFromFile_unsafe(
    "wallets/shard2.json",
    config.walletFilePassword
  );

export const selectWallet = (shard: ShardType) => {
  switch (shard) {
    case 0:
      return walletShard0;
    case 1:
      return walletShard1;
    case 2:
      return walletShard2;
  }
};

export const wrapEGLD = async (amount: number, shard: ShardType) => {
  const wallet = selectWallet(shard);
  const w = await wallet();
  const result = await w.callContract({
    callee: wrapEgldContract[shard],
    funcName: "wrapEgld",
    gasLimit: 5_000_000,
    value: amount,
  });

  console.log("WrapEGLD Transaction:", result.tx.explorerUrl);
};

export const tradeToken = async ({
  tokenToPay,
  amountToPay,
  tokenToBuy,
  minAmountToBuy,
  scAddress,
  shard,
}: {
  amountToPay: number;
  tokenToPay: string;
  tokenToBuy: string;
  minAmountToBuy: number;
  scAddress: string;
  shard: ShardType;
}) => {
  const wallet = selectWallet(shard);
  const w = await wallet();
  const result = await w.callContract({
    callee: scAddress,
    funcName: "swapTokensFixedInput",
    gasLimit: 20_000_000,
    esdts: [
      {
        amount: amountToPay,
        nonce: 0,
        id: tokenToPay,
      },
    ],
    funcArgs: [e.Str(tokenToBuy), e.U(minAmountToBuy)],
  });

  return result.tx;
};
