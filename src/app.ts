import { trade } from "./bot";
import config from "./config";
import { error } from "./utils/notify";
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
    await trade(shard); // Trade with shard 1
  }

  isTrading = false; // Marca que el ciclo de trade ha terminado
};

const app = async () => {
  while (true) {
    try {
      await main(); // Llama a main en el intervalo configurado

      await new Promise((resolve) => setTimeout(resolve, config.loopSeconds));
    } catch (err: any) {
      error(
        `App fallo gravemente\n\nMensaje: ${err.message}\n\nCode: ${err.code}`
      );
    }
  }
};

app();
