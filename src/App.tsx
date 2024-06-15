import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import initDuckDb from "./duckdb-init";
import { useDuckDb } from "duckdb-wasm-kit";

function App() {
  const [count, _] = useState(0);

  useEffect(() => {
    initDuckDb();
  }, []);

  const { db, loading, error } = useDuckDb();

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file: File | null | undefined = event.target.files?.item(0);

    if (file) {
      const tempFile = "test.json";
      const tableName = "test";

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
    await db?.registerFileText(
      "rows.json",
      `[
  { “col1”: 1, “col2”: “foo” },
  { “col1”: 2, “col2”: “bar” },
]`
    );
    // ... or column-major format
    await db?.registerFileText(
      "columns.json",
      `{
  "col1": [1, 2],
  "col2": ["foo", "bar"]
}`
    );
    console.log("Files registered");
    const c = await db?.connect();

    //await c?.insertJSONFromPath("rows.json", { name: "rows", schema: "main" });
    //await c?.insertJSONFromPath("columns.json", { name: "columns" });

    const result = await c?.query<any>(`DESCRIBE test`);

    console.log(
      "Result",
      result?.toArray().map((row) => row.toJSON())
    );
  }

  return (
    <>
      <h1>Vite + React</h1>
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
