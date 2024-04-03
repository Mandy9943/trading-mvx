export interface ITokenBalance {
  type: string;
  identifier: string;
  name: string;
  ticker: string;
  owner: string;
  decimals: number;
  isPaused: boolean;
  transactions: number;
  transfersCount: number;
  accounts: number;
  canUpgrade: boolean;
  canMint: boolean;
  canBurn: boolean;
  canChangeOwner: boolean;
  canAddSpecialRoles: boolean;
  canPause: boolean;
  canFreeze: boolean;
  canWipe: boolean;
  mexPairType: string;
  balance: string;
}

export interface IPair {
  address: string;
  firstToken: {
    balance: null;
    decimals: number;
    name: string;
    identifier: string;
    ticker: string;
    owner: string;
    assets: {
      website: string;
      description: string;
      status: string;
      pngUrl: string;
      svgUrl: string;
      __typename: string;
    };
    price: string;
    type: string;
    __typename: string;
  };
  firstTokenPrice: string;
  firstTokenPriceUSD: string;
  firstTokenVolume24h: string;
  firstTokenLockedValueUSD: string;
  secondToken: {
    balance: null | string;
    decimals: number;
    name: string;
    identifier: string;
    ticker: string;
    owner: string;
    assets: {
      website: string;
      description: string;
      status: string;
      pngUrl: string;
      svgUrl: string;
      __typename: string;
    };
    price: string;
    type: string;
    __typename: string;
  };
  secondTokenPrice: string;
  secondTokenPriceUSD: string;
  secondTokenVolume24h: string;
  secondTokenLockedValueUSD: string;
  initialLiquidityAdder: string;
  liquidityPoolToken: {
    balance: null;
    decimals: number;
    name: string;
    identifier: string;
    ticker: string;
    owner: string;
    assets: {
      website: null | string;
      description: null | string;
      status: null | string;
      pngUrl: null | string;
      svgUrl: null | string;
      __typename: string;
    };
    price: string;
    type: string;
    __typename: string;
  };
  state: "PartialActive" | "Active";
  type: string;
  lockedValueUSD: string;
  info: {
    reserves0: string;
    reserves1: string;
    totalSupply: string;
    __typename: string;
  };
  feesAPR: string;
  feesUSD24h: string;
  volumeUSD24h: string;
  totalFeePercent: number;
  specialFeePercent: number;
  lockedTokensInfo: null;
  feesCollector: null;
  feeDestinations: any[];
  trustedSwapPairs: any[];
  whitelistedManagedAddresses: any[];
  __typename: string;
}

export type ShardType = 0 | 1 | 2;
