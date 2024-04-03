import { promises as fs } from "fs";
import { IPair } from "../services/types";

interface IDb {
  pools: IPair[];
  operation: boolean;
}

class Storage {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
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
    const dataStr = JSON.stringify(data, null, 2); // Formatea el JSON para mejorar la legibilidad
    await fs.writeFile(this.filePath, dataStr, { encoding: "utf8" });
  }

  async updateData(data: Partial<IDb>): Promise<void> {
    const oldData = await this.readData();
    const newData = { ...oldData, ...data };
    await this.writeData(newData);
  }

  async readPools(): Promise<IPair[]> {
    try {
      const data = await fs.readFile(this.filePath, { encoding: "utf8" });
      return (JSON.parse(data) as IDb).pools;
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        // Si el archivo no existe, retorna un arreglo vacío
        return [];
      } else {
        // Re-lanza cualquier otro error
        throw error;
      }
    }
  }

  async writePools(pools: IPair[]): Promise<void> {
    const oldData = await this.readData();
    const data = JSON.stringify({ ...oldData, pools }, null, 2);

    await fs.writeFile(this.filePath, data, { encoding: "utf8" });
  }

  // Método para añadir o actualizar un pool
  async upsertPool(pool: IPair): Promise<void> {
    const pools = await this.readPools();
    const existingIndex = pools.findIndex((p) => p.address === pool.address);
    if (existingIndex !== -1) {
      pools[existingIndex] = pool; // Actualiza
    } else {
      pools.push(pool); // Añade
    }
    await this.writePools(pools);
  }
}

export default new Storage("pools.json");
