import { DuckDBConfig } from "@duckdb/duckdb-wasm";
import { initializeDuckDb } from "duckdb-wasm-kit";

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

export default function initDuckDb() {
  initializeDuckDb({ config, debug: true })
    .then((duckDb) => {
      console.log("DuckDB initialized", duckDb);
    })
    .catch((error) => {
      console.error("DuckDB initialization failed", error);
    });
}
