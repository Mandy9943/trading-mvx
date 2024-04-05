// bot/index.test.ts
import { fetchTokenBalanceByAccount } from "../services/api";
import { tradeToken } from "../services/blochain-oprations";
import { IPair, ShardType } from "../services/types";
import logger from "../utils/logger";
import * as notify from "../utils/notify";
import { buyToken } from "./index";

// Mock your modules
jest.mock("../services/api", () => {
  // Get the actual module so that we can use its real implementations
  const actualApi = jest.requireActual("../services/api");

  return {
    ...actualApi, // Spread all real implementations
    fetchTokenBalanceByAccount: jest.fn(), // Override the specific function with a mock
  };
});

jest.mock("../utils/logger");
jest.mock("../utils/notify");
jest.mock("../config");
jest.mock("../services/blochain-oprations", () => ({
  tradeToken: jest.fn(),
}));

jest.mock("../utils/notify", () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

// Typing the mocks for TypeScript
const mockFetchTokenBalanceByAccount = fetchTokenBalanceByAccount as jest.Mock;
const mockTradeToken = tradeToken as jest.Mock;
describe("buyToken", () => {
  const pair: IPair = {
    address: "erd1qqqqqqqqqqqqqpgqryy464yxfjv3m62ckhllprmvtc6y9sm82jpsjfrqlm",
    firstToken: {
      balance: null,
      decimals: 18,
      name: "PYGMY",
      identifier: "PYG-ba998f",
      ticker: "PYG",
      owner: "erd16ykfhlnxtspsqp0ku34prl5p0x57n5z2l39ldy3k33tnp05q0pzqqktzvg",
      assets: {
        website: "https://multiversx.com/",
        description: "Welcome to the PYGMY ecosystem! Enjoy!",
        status: "active",
        pngUrl: "https://media.elrond.com/tokens/asset/PYG-ba998f/logo.png",
        svgUrl: "https://media.elrond.com/tokens/asset/PYG-ba998f/logo.svg",
        __typename: "AssetsModel",
      },
      price:
        "0.0000000934461121613178197280781718867311397509675739038435828864",
      type: "Experimental",
      __typename: "EsdtToken",
    },
    firstTokenPrice: "0.00000000173068020155179208078231601608",
    firstTokenPriceUSD:
      "0.0000000934461121613178197280781718867311397509675739038435828864",
    firstTokenVolume24h:
      "1001591727776848014279527175.0000000000000000000000000000000000000000000000000000000000000000",
    firstTokenLockedValueUSD:
      "581.7810290994428514934672943868574834338460378599416372647327779236836820811793985024",
    secondToken: {
      balance: null,
      decimals: 18,
      name: "WrappedEGLD",
      identifier: "WEGLD-bd4d79",
      ticker: "WEGLD",
      owner: "erd1ss6u80ruas2phpmr82r42xnkd6rxy40g9jl69frppl4qez9w2jpsqj8x97",
      assets: {
        website: "https://xexchange.com",
        description:
          "wEGLD is an ESDT token that has the same value as EGLD, the native coin of the MultiversX blockchain.",
        status: "active",
        pngUrl: "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.png",
        svgUrl: "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.svg",
        __typename: "AssetsModel",
      },
      price: "53.99386442251466706927477008",
      type: "Core",
      __typename: "EsdtToken",
    },
    secondTokenPrice: "577807499.67750419620205880494461101861911607061",
    secondTokenPriceUSD: "53.99386442251466706927477008",
    secondTokenVolume24h:
      "1951996739862517904.0000000000000000000000000000000000000000000000000000000000000000",
    secondTokenLockedValueUSD:
      "581.78102909944285149346729438960797693350963136",
    initialLiquidityAdder:
      "erd16ykfhlnxtspsqp0ku34prl5p0x57n5z2l39ldy3k33tnp05q0pzqqktzvg",
    liquidityPoolToken: {
      balance: null,
      decimals: 18,
      name: "PYGWEGLDLP",
      identifier: "PYGWEGLD-b087ba",
      ticker: "PYGWEGLD-b087ba",
      owner: "erd1qqqqqqqqqqqqqpgqq66xk9gfr4esuhem3jru86wg5hvp33a62jps2fy57p",
      assets: {
        website: null,
        description: null,
        status: null,
        pngUrl: null,
        svgUrl: null,
        __typename: "AssetsModel",
      },
      price: "0",
      type: "Unlisted",
      __typename: "EsdtToken",
    },
    state: "Active",
    type: "Experimental",
    lockedValueUSD:
      "1163.5620581988857029869345887764654603673556692199416372647327779236836820811793985024",
    info: {
      reserves0: "6225845202581602083653176316",
      reserves1: "10774947030034184892",
      totalSupply: "20020000000000000000",
      __typename: "PairInfoModel",
    },
    feesAPR: "0.32545507308285416561",
    feesUSD24h:
      "1.0921043249821328290100000000000000000000000000000000000000000000",
    volumeUSD24h:
      "106.3449938661204204686100000000000000000000000000000000000000000000",
    totalFeePercent: 0.01,
    specialFeePercent: 0.0005,
    lockedTokensInfo: null,
    feesCollector: null,
    feeDestinations: [],
    trustedSwapPairs: [],
    whitelistedManagedAddresses: [],
    __typename: "PairModel",
  };
  const shard: ShardType = 1;

  it("should return true on successful buy", async () => {
    // Setup the mock implementations for success case

    mockFetchTokenBalanceByAccount.mockImplementationOnce(async () => ({
      type: "FungibleESDT",
      identifier: "WEGLD-bd4d79",
      name: "WrappedEGLD",
      ticker: "WEGLD",
      owner: "erd1ss6u80ruas2phpmr82r42xnkd6rxy40g9jl69frppl4qez9w2jpsqj8x97",
      decimals: 18,
      isPaused: false,
      assets: {
        website: "https://xexchange.com",
        description:
          "wEGLD is an ESDT token that has the same value as EGLD, the native coin of the MultiversX blockchain.",
        status: "active",
        pngUrl: "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.png",
        svgUrl: "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.svg",
        ledgerSignature:
          "3044022062a68d4bdd649aebb5e4ed5c6284e211c689c3b8142e59a47b01cc9997b16dfa0220475b064836849b9c4aa9c5ff18daed91a64f847bd96aa0a26768349f2cd0c24f",
      },
      transactions: 7454651,
      transfersCount: 28846075,
      accounts: 135425,
      canUpgrade: true,
      canMint: true,
      canBurn: true,
      canChangeOwner: true,
      canAddSpecialRoles: true,
      canPause: true,
      canFreeze: true,
      canWipe: true,
      price: 53.99386442251467,
      marketCap: 39295960.364515856,
      supply: "727785662034036573853270",
      circulatingSupply: "727785662034036573853270",
      mexPairType: "core",
      totalLiquidity: 30796307.601287376,
      totalVolume24h: 3660104.602795636,
      balance: "130866931783743933",
      valueUsd: 7.066011372121945,
    }));

    mockTradeToken.mockImplementationOnce(async () => ({
      explorerUrl: "http://example.com",
    }));

    const result = await buyToken(pair as IPair, shard);

    expect(result).toBe(true);
    expect(mockFetchTokenBalanceByAccount).toHaveBeenCalledTimes(1);
    expect(mockTradeToken).toHaveBeenCalledTimes(1);

    expect(notify.error).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(expect.any(String));
  });
});
