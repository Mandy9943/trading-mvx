import axios from "axios";
import { selectWallet } from "./blochain-oprations";
import { IPair, ITokenBalance, ShardType } from "./types";

const api = axios.create({
  baseURL: "https://api.multiversx.com",
});

export const fetchTokensBalance = async (
  address: string
): Promise<ITokenBalance[]> => {
  const { data } = await api.get<ITokenBalance[]>(
    `/accounts/${address}/tokens`
  );
  return data;
};

export const fetchTokenBalanceByAccount = async (
  tokenIdentifier: string,
  shard: ShardType
): Promise<ITokenBalance | undefined> => {
  const wallet = selectWallet(shard);
  const address = (await wallet().getAccount()).address;
  const tokensBlance = await fetchTokensBalance(address);
  const tokenBalance = tokensBlance.find(
    (token) => token.identifier === tokenIdentifier
  );

  return tokenBalance!;
};

export const fetchXexchangePairs = async (): Promise<IPair[]> => {
  const response = await fetch("https://graph.xexchange.com/graphql", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    //make sure to serialize your JSON body
    body: JSON.stringify({
      operationName: "activePoolsDataQuery",
      variables: {
        offset: 180,
        limit: 500,
      },
      query: `query activePoolsDataQuery($offset: Int!, $limit: Int!) {
              pairs(offset: $offset, limit: $limit) {
                address
                firstToken {
                  balance
                  decimals
                  name
                  identifier
                  ticker
                  owner
                  assets {
                    website
                    description
                    status
                    pngUrl
                    svgUrl
                    __typename
              }\n      price\n      type\n      __typename\n    }\n    firstTokenPrice\n    firstTokenPriceUSD\n    firstTokenVolume24h\n    firstTokenLockedValueUSD\n    secondToken {\n      balance\n      decimals\n      name\n      identifier\n      ticker\n      owner\n      assets {\n        website\n        description\n        status\n        pngUrl\n        svgUrl\n        __typename\n      }\n      price\n      type\n      __typename\n    }\n    secondTokenPrice\n    secondTokenPriceUSD\n    secondTokenVolume24h\n    secondTokenLockedValueUSD\n    initialLiquidityAdder\n    liquidityPoolToken {\n      balance\n      decimals\n      name\n      identifier\n      ticker\n      owner\n      assets {\n        website\n        description\n        status\n        pngUrl\n        svgUrl\n        __typename\n      }\n      price\n      type\n      __typename\n    }\n    state\n    type\n    lockedValueUSD\n    info {\n      reserves0\n      reserves1\n      totalSupply\n      __typename\n    }\n    feesAPR\n    feesUSD24h\n    volumeUSD24h\n    totalFeePercent\n    specialFeePercent\n    lockedTokensInfo {\n      lockingSC {\n        address\n        lockedToken {\n          assets {\n            website\n            description\n            status\n            pngUrl\n            svgUrl\n            __typename\n          }\n          decimals\n          name\n          collection\n          ticker\n          __typename\n        }\n        lpProxyToken {\n          assets {\n            website\n            description\n            status\n            pngUrl\n            svgUrl\n            __typename\n          }\n          decimals\n          name\n          collection\n          ticker\n          __typename\n        }\n        farmProxyToken {\n          assets {
                        website
                        description
                        status
                        pngUrl
                        svgUrl
                        __typename
                  }
                    decimals
                    name
                    collection
                    ticker
                    __typename
                }
                  intermediatedPairs
                  intermediatedFarms
                  __typename
              }
                unlockEpoch
                __typename
            }
              feesCollector {
                  address
                  __typename
            }
              feeDestinations {
                  address
                  tokenID
                  __typename
            }
              trustedSwapPairs
              whitelistedManagedAddresses
              __typename
          }
        }
          `,
    }),
  });

  const { data } = await response.json();

  return data.pairs;
};

export const fetchXechangePair = async (address: string): Promise<IPair> => {
  try {
    const pairs = await fetchXexchangePairs();

    return pairs.find((pair) => pair.address === address)!;
  } catch (error) {
    return await fetchXechangePair(address);
  }
};
