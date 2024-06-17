import { useEffect } from "react";
import { Button } from "@/components/ui/button";

import { initDuckDb } from "./lib/duckdb";
import { useDuckDb } from "duckdb-wasm-kit";

import { getAllStoredFiles, storeFile } from "./lib/storage";

function App() {
  useEffect(() => {
    initDuckDb();
  }, []);

  const { db } = useDuckDb();

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file: File | null | undefined = event.target.files?.item(0);

    if (file) {
      const tempFile = "test.json";
      const tableName = "test";

      await storeFile(file);

      console.log("Files", await getAllStoredFiles());

      const buffer = new Uint8Array(await file.arrayBuffer());

      await db?.registerFileBuffer(tempFile, buffer);

      console.log("File registered", tempFile);

      const conn = await db?.connect();

      await conn?.query(
        `CREATE TABLE ${tableName} AS SELECT * FROM read_json_auto('${tempFile}', maximum_depth=2)`
      );

      const result = await conn?.query(
        `SELECT json_group_structure(facts.dei) FROM ${tableName}`
      );

      console.log("Result", result?.toString());

      await conn?.close();
      await db?.dropFile(tempFile);
    }
  }

  async function testJson() {
    db?.flushFiles();
    // const c = await db?.connect();

    // const result = await c?.query<any>(`DESCRIBE test`);

    // console.log(
    //   "Result",
    //   result?.toArray().map((row) => row.toJSON())
    // );

    console.log("Files", await getAllStoredFiles());
  }

  return (
    <>
      <div className="card">
        <Button onClick={() => testJson()}>Click me</Button>
        <p>
          <input type="file" onChange={handleChange} />
        </p>
      </div>
    </>
  );
}

export default App;
