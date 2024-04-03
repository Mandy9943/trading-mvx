import { trade } from "./bot";
import storage from "./utils/storage";

const main = async () => {
  trade(1); /* Trade with shard 1 */

  setTimeout(async () => {
    const data = await storage.readData();

    if (!data.operation) {
      main();
    }
  }, 10000);
};

main();
