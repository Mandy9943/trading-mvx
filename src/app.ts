import { trade } from "./bot";
import config from "./config";
import logger from "./utils/logger";
import { operationStorage } from "./utils/storage";

let isTrading = false; // Controla si ya hay un ciclo de trade en ejecución

const main = async () => {
  if (isTrading) {
    return; // Si ya se está ejecutando, simplemente retorna sin hacer nada
  }

  isTrading = true; // Marca que el ciclo de trade ha comenzado

  const shard = 1;

  const data = await operationStorage.readData();

  if (!data.operation) {
    console.log("\n");
    logger.info("---Starting new cycle---");
    await trade(shard); // Trade with shard 1
  }

  isTrading = false; // Marca que el ciclo de trade ha terminado
};

const app = async () => {
  while (true) {
    await main(); // Llama a main en el intervalo configurado

    await new Promise((resolve) => setTimeout(resolve, config.loopSeconds));
  }
};

app();
