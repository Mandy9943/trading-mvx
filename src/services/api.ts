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

export async function fetchTokensBalance(
  address: string
): Promise<ITokenBalance[]> {
  const { data } = await api.get<ITokenBalance[]>(
    `/accounts/${address}/tokens`
  );
  return data;
}

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
        offset: 400,
        limit: 1000,
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
                  
                       price
                       type
                       __typename
                     }
                     firstTokenPrice
                     firstTokenLockedValueUSD
                     secondToken {
                       balance
                       decimals
                       name
                       identifier
                       ticker
                       owner
                       
                       price
                       type
                       __typename
                     }
                     secondTokenPrice
                     secondTokenLockedValueUSD
                     
                     state
                     type
                     lockedValueUSD
                     
                     volumeUSD24h
                     
    
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
