import { DuckDBConfig } from "@duckdb/duckdb-wasm";
import { AsyncDuckDB, initializeDuckDb } from "duckdb-wasm-kit";

const config: DuckDBConfig = {
  query: {
    /**
     * By default, int values returned by DuckDb are Int32Array(2).
     * This setting tells DuckDB to cast ints to double instead,
     * so they become JS numbers.
     */
    castBigIntToDouble: true,
  },
};

export function initDuckDb() {
  initializeDuckDb({ config, debug: false })
    .then((duckDb) => {
      console.log("DuckDB initialized", duckDb);
    })
    .catch((error) => {
      console.error("DuckDB initialization failed", error);
    });
}

export function registerFile(db: AsyncDuckDB, filename: string, file: File) {
  return new Promise<Uint8Array>((resolve, reject) => {
    if (!file) {
      reject("No file provided");
      return;
    }

    file
      .arrayBuffer()
      .then((buffer) => {
        db.registerFileBuffer(filename, new Uint8Array(buffer));
        resolve(new Uint8Array(buffer));
      })
      .catch(reject);
  });
}
