import { promises as fs } from "fs";
import { IPair } from "../services/types";

interface IGENERALDb {
  pools: IPair[];
  operation: boolean;
}

type IDb = Partial<IGENERALDb>;

class Storage {
  private filePath: string;
  private writeQueue: Promise<any> = Promise.resolve();

  constructor(filePath: string) {
    this.filePath = filePath;
  }
  private enqueueWrite(operation: () => Promise<void>): Promise<void> {
    this.writeQueue = this.writeQueue.then(operation, operation);
    return this.writeQueue;
  }

  async readData(): Promise<IDb> {
    try {
      const data = await fs.readFile(this.filePath, { encoding: "utf8" });
      return JSON.parse(data) as IDb;
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        // Si el archivo no existe, retorna un objeto vacío
        return { pools: [], operation: false };
      } else {
        // Re-lanza cualquier otro error
        throw error;
      }
    }
  }

  async writeData(data: IDb): Promise<void> {
    return this.enqueueWrite(async () => {
      const dataStr = JSON.stringify(data, null, 2);
      await fs.writeFile(this.filePath, dataStr, { encoding: "utf8" });
    });
  }

  async updateData(data: Partial<IDb>): Promise<void> {
    const oldData = await this.readData();
    const newData = { ...oldData, ...data };

    await this.writeData(newData);
  }
}

export default Storage;

export const poolStorage = new Storage("pools.json");
export const operationStorage = new Storage("operation.json");
