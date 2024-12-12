import { trade } from "./bot";
import config from "./config";
import { selectWallet } from "./services/blochain-oprations";
import { error, info } from "./utils/notify";
import { operationStorage } from "./utils/storage";

let isTrading = false; // Controla si ya hay un ciclo de trade en ejecución

const shard = 1;

const main = async () => {
  if (isTrading) {
    return; // Si ya se está ejecutando, simplemente retorna sin hacer nada
  }

  isTrading = true; // Marca que el ciclo de trade ha comenzado

  const data = await operationStorage.readData();

  if (!data.operation) {
    await trade(shard); // Trade with shard 1
  }

  isTrading = false; // Marca que el ciclo de trade ha terminado
};

const app = async () => {
  info(`Started with wallet ${selectWallet(shard)().toString()}`);
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
