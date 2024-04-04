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
    logger.info("\n---Starting new cycle---");
    trade(shard); // Trade with shard 1
  }

  isTrading = false; // Marca que el ciclo de trade ha terminado
};

// Configura el intervalo para llamar a main cada 10 segundos
setInterval(() => {
  main(); // Llama a main en el intervalo configurado
}, config.loopSeconds);

setTimeout(() => {
  main(); // Inicia el primer llamado inmediatamente
}, 5000);
