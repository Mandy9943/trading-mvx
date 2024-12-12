import BigNumber from "bignumber.js";
import { wrapEGLD } from "./services/blochain-oprations";
import { ShardType } from "./services/types";

const wrapEgldFunc = async (amount: number, shard: ShardType) => {
  wrapEGLD(new BigNumber(amount).multipliedBy(10 ** 18).toNumber(), shard);
};

wrapEgldFunc(0.002, 1);
