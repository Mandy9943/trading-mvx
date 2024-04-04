import axios from "axios";
import { addressBaseOnShard } from "../config/network";
import { IPair, ITokenBalance, ShardType } from "./types";

const api = axios.create({
  baseURL: "https://api.multiversx.com",
  timeout: 40000,
});

/**
 * Función de reintento genérica para operaciones asíncronas en TypeScript.
 *
 * @param asyncFunc La función asíncrona a ejecutar.
 * @param args Argumentos para la función asíncrona.
 * @param maxAttempts Número máximo de intentos antes de fallar.
 * @param delay Tiempo de espera entre intentos en milisegundos.
 * @returns Promesa con el resultado de la función asíncrona.
 * @throws Error si se alcanza el máximo número de intentos sin éxito.
 */
export async function retryAsyncFunction<T, Args extends any[]>(
  asyncFunc: (...args: Args) => Promise<T>,
  args: Args,
  maxAttempts: number = 100,
  delay: number = 500
): Promise<T> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      // Ejecuta la función con los argumentos proporcionados y devuelve el resultado si es exitoso
      return await asyncFunc(...args);
    } catch (error) {
      attempts++;
      console.log(`Attempt ${attempts} failed: ${(error as Error).message}`);
      if (attempts >= maxAttempts) {
        // Lanza un error después del último intento fallido
        throw new Error(
          `Max retry attempts reached. Last error: ${(error as Error).message}`
        );
      }
      // Espera por el tiempo definido antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  // Este punto no debería alcanzarse, pero TypeScript necesita asegurarse de que siempre hay un retorno.
  throw new Error("Unexpected loop termination in retryAsyncFunction");
}

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
  const address = addressBaseOnShard[shard];

  const tokensBalance = await fetchTokensBalance(address);

  const tokenBalance = tokensBalance.find(
    (token) => token.identifier === tokenIdentifier
  );
  return tokenBalance;
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
        offset: 205,
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

  // const data: { pairs: IPair[] } = {
  //   pairs: [
  //     {
  //       address:
  //         "erd1qqqqqqqqqqqqqpgqt8d3tr2yczf4ftgxfcpk3hmye7yj5cxz2jpsmaskes",
  //       firstToken: {
  //         balance: null,
  //         decimals: 18,
  //         name: "FEDUP",
  //         identifier: "FEDUP-0994a9",
  //         ticker: "FEDUP",
  //         owner:
  //           "erd1vudplk63q6fph97suwkqeafw2hmlgctp2aqszsxhv5ur3lkvgrmscg53uk",
  //         assets: {
  //           website: "https://fedupclown.com/",
  //           description: "Lowkey Degen clown 🤡 movement. We run the asylum ",
  //           status: "active",
  //           pngUrl:
  //             "https://media.elrond.com/tokens/asset/FEDUP-0994a9/logo.png",
  //           svgUrl:
  //             "https://media.elrond.com/tokens/asset/FEDUP-0994a9/logo.svg",
  //           __typename: "AssetsModel",
  //         },
  //         price:
  //           "0.0000000001454911309914499053063043623914519965609430676829535844",
  //         type: "Experimental",
  //         __typename: "EsdtToken",
  //       },
  //       firstTokenPrice: "0.00000000000269261458572713494601635282",
  //       firstTokenPriceUSD:
  //         "0.0000000001454911309914499053063043623914519965609430676829535844",
  //       firstTokenVolume24h:
  //         "240189993981779988224369727301301.0000000000000000000000000000000000000000000000000000000000000000",
  //       firstTokenLockedValueUSD:
  //         "3532.911542498446332244248778544686911611771166334518260995894740018947005851330275248",
  //       secondToken: {
  //         balance: null,
  //         decimals: 18,
  //         name: "WrappedEGLD",
  //         identifier: "WEGLD-bd4d79",
  //         ticker: "WEGLD",
  //         owner:
  //           "erd1ss6u80ruas2phpmr82r42xnkd6rxy40g9jl69frppl4qez9w2jpsqj8x97",
  //         assets: {
  //           website: "https://xexchange.com",
  //           description:
  //             "wEGLD is an ESDT token that has the same value as EGLD, the native coin of the MultiversX blockchain.",
  //           status: "active",
  //           pngUrl:
  //             "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.png",
  //           svgUrl:
  //             "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.svg",
  //           __typename: "AssetsModel",
  //         },
  //         price: "54.03340372686881557699347042",
  //         type: "Core",
  //         __typename: "EsdtToken",
  //       },
  //       secondTokenPrice: "371386237488.55318937245691538432012672275166702746",
  //       secondTokenPriceUSD: "54.03340372686881557699347042",
  //       secondTokenVolume24h:
  //         "1056821118835856147752.0000000000000000000000000000000000000000000000000000000000000000",
  //       secondTokenLockedValueUSD:
  //         "3532.91154249844633224424878238662911963987479956",
  //       initialLiquidityAdder:
  //         "erd1vudplk63q6fph97suwkqeafw2hmlgctp2aqszsxhv5ur3lkvgrmscg53uk",
  //       liquidityPoolToken: {
  //         balance: null,
  //         decimals: 18,
  //         name: "FEDUPWEGLDLP",
  //         identifier: "FEDUPWEGLD-ca8885",
  //         ticker: "FEDUPWEGLD-ca8885",
  //         owner:
  //           "erd1qqqqqqqqqqqqqpgqq66xk9gfr4esuhem3jru86wg5hvp33a62jps2fy57p",
  //         assets: {
  //           website: null,
  //           description: null,
  //           status: null,
  //           pngUrl: null,
  //           svgUrl: null,
  //           __typename: "AssetsModel",
  //         },
  //         price: "0",
  //         type: "Unlisted",
  //         __typename: "EsdtToken",
  //       },
  //       state: "Active",
  //       type: "Experimental",
  //       lockedValueUSD:
  //         "7041.31393031296492990730530978207800369962547949191217290799684934153418662650617032",
  //       info: {
  //         reserves0: "24282668575299978927123824782220",
  //         reserves1: "65383867586230670913",
  //         totalSupply: "50324386389871177941",
  //         __typename: "PairInfoModel",
  //       },
  //       feesAPR: "29.23558856808510480224",
  //       feesUSD24h:
  //         "595.7421105437120466691700000000000000000000000000000000000000000000",
  //       volumeUSD24h:
  //         "57943.0373061802505098253100000000000000000000000000000000000000000000",
  //       totalFeePercent: 0.01,
  //       specialFeePercent: 0.0005,
  //       lockedTokensInfo: null,
  //       feesCollector: null,
  //       feeDestinations: [],
  //       trustedSwapPairs: [],
  //       whitelistedManagedAddresses: [],
  //       __typename: "PairModel",
  //     },
  //     {
  //       address:
  //         "erd1qqqqqqqqqqqqqpgql8k7m0c5qegcp4lvknfawr8cchpgpksh2jps6cdnsm",
  //       firstToken: {
  //         balance: null,
  //         decimals: 18,
  //         name: "BabyBlob",
  //         identifier: "BLOB-d0b7e0",
  //         ticker: "BLOB",
  //         owner:
  //           "erd1tkjsdk2q2tmmuqa8eygudyp2c8auuymm8srah9d3wmpesfs8sdls43qyk0",
  //         assets: {
  //           website: "https://nexusdapp.com ",
  //           description:
  //             "Sparking joy, spreading awareness, and fostering social connections. ",
  //           status: "active",
  //           pngUrl:
  //             "https://media.elrond.com/tokens/asset/BLOB-d0b7e0/logo.png",
  //           svgUrl:
  //             "https://media.elrond.com/tokens/asset/BLOB-d0b7e0/logo.svg",
  //           __typename: "AssetsModel",
  //         },
  //         price:
  //           "0.0000113734994342984067443682487357542676690297278425895561653244",
  //         type: "Experimental",
  //         __typename: "EsdtToken",
  //       },
  //       firstTokenPrice: "0.00000020978183806322428038422192676581",
  //       firstTokenPriceUSD:
  //         "0.0000113352267506348131839661367476668638704104377512137985023402",
  //       firstTokenVolume24h:
  //         "13766685845457532818103056420.0000000000000000000000000000000000000000000000000000000000000000",
  //       firstTokenLockedValueUSD:
  //         "7950.361588770356229808128988632842830352336503093171536579394726419082280550004771112",
  //       secondToken: {
  //         balance: null,
  //         decimals: 18,
  //         name: "WrappedEGLD",
  //         identifier: "WEGLD-bd4d79",
  //         ticker: "WEGLD",
  //         owner:
  //           "erd1ss6u80ruas2phpmr82r42xnkd6rxy40g9jl69frppl4qez9w2jpsqj8x97",
  //         assets: {
  //           website: "https://xexchange.com",
  //           description:
  //             "wEGLD is an ESDT token that has the same value as EGLD, the native coin of the MultiversX blockchain.",
  //           status: "active",
  //           pngUrl:
  //             "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.png",
  //           svgUrl:
  //             "https://media.elrond.com/tokens/asset/WEGLD-bd4d79/logo.svg",
  //           __typename: "AssetsModel",
  //         },
  //         price: "54.03340372686881557699347042",
  //         type: "Core",
  //         __typename: "EsdtToken",
  //       },
  //       secondTokenPrice: "4766856.8891965705033339259467898621062040181",
  //       secondTokenPriceUSD: "54.03340372686881557699347042",
  //       secondTokenVolume24h:
  //         "3692616828120516227111.0000000000000000000000000000000000000000000000000000000000000000",
  //       secondTokenLockedValueUSD:
  //         "7950.361588770356229808128988632937293205428705",
  //       initialLiquidityAdder:
  //         "erd1tkjsdk2q2tmmuqa8eygudyp2c8auuymm8srah9d3wmpesfs8sdls43qyk0",
  //       liquidityPoolToken: {
  //         balance: null,
  //         decimals: 18,
  //         name: "BLOBWEGLDLP",
  //         identifier: "BLOBWEGLD-0f686e",
  //         ticker: "BLOBWEGLD-0f686e",
  //         owner:
  //           "erd1qqqqqqqqqqqqqpgqq66xk9gfr4esuhem3jru86wg5hvp33a62jps2fy57p",
  //         assets: {
  //           website: null,
  //           description: null,
  //           status: null,
  //           pngUrl: null,
  //           svgUrl: null,
  //           __typename: "AssetsModel",
  //         },
  //         price: "0",
  //         type: "Unlisted",
  //         __typename: "EsdtToken",
  //       },
  //       state: "PartialActive",
  //       type: "Experimental",
  //       lockedValueUSD:
  //         "15883.1271447950934280418851436617493197634962108782333233028622963117739305794459887604",
  //       info: {
  //         reserves0: "702647678208314384349301908",
  //         reserves1: "147402721445397132249",
  //         totalSupply: "50000000000000000000",
  //         __typename: "PairInfoModel",
  //       },
  //       feesAPR: "36.55474500378588389823",
  //       feesUSD24h:
  //         "1682.2413520969854592348200000000000000000000000000000000000000000000",
  //       volumeUSD24h:
  //         "203501.2662969813709185953700000000000000000000000000000000000000000000",
  //       totalFeePercent: 0.01,
  //       specialFeePercent: 0.0005,
  //       lockedTokensInfo: null,
  //       feesCollector: null,
  //       feeDestinations: [],
  //       trustedSwapPairs: [],
  //       whitelistedManagedAddresses: [],
  //       __typename: "PairModel",
  //     },
  //   ],
  // };

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
