import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { initDuckDb } from "./lib/duckdb";
import { useDuckDb } from "duckdb-wasm-kit";

import { getAllStoredFiles, storeFile } from "./lib/storage";

interface FlattenedPath {
  path: string;
  type: string;
  example?: string;
}

function App() {
  const [paths, setPaths] = useState<FlattenedPath[]>([]);
  const { db } = useDuckDb();

  useEffect(() => {
    initDuckDb();
  }, []);

  // Helper function to detect if a string is a UUID
  const isUUID = (str: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Recursively flatten JSON schema
  const flattenSchema = (
    obj: any,
    parentPath: string = "",
    results: FlattenedPath[] = []
  ): FlattenedPath[] => {
    if (!obj) return results;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;

      if (Array.isArray(value)) {
        // Check array contents
        const nonUuidItems = value.filter((item) => !isUUID(item));
        if (nonUuidItems.length > 0) {
          // Sample the first non-UUID object to get structure
          const sampleItem = nonUuidItems[0];
          if (typeof sampleItem === "object" && sampleItem !== null) {
            // Replace array index with [_] notation
            const arrayPath = currentPath + "[_]";
            flattenSchema(sampleItem, arrayPath, results);
          } else {
            results.push({
              path: currentPath + "[_]",
              type: typeof sampleItem,
              example: String(sampleItem).substring(0, 50),
            });
          }
        }
      } else if (typeof value === "object" && value !== null) {
        flattenSchema(value, currentPath, results);
      } else {
        results.push({
          path: currentPath,
          type: typeof value,
          example: String(value).substring(0, 50),
        });
      }
    }

    return results;
  };

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file: File | null | undefined = event.target.files?.item(0);
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text); // Validate JSON
      const flattened = flattenSchema(json);
      setPaths(flattened);

      // Store in DuckDB if needed
      const tempFile = "schema.json";
      await storeFile(file);

      const buffer = new Uint8Array(await file.arrayBuffer());
      await db?.registerFileBuffer(tempFile, buffer);

      const conn = await db?.connect();
      if (conn) {
        // Create a table with the flattened schema
        await conn.query(`
          CREATE TABLE IF NOT EXISTS json_paths (
            path VARCHAR,
            type VARCHAR,
            example VARCHAR
          )
        `);

        // Insert the paths
        for (const path of flattened) {
          await conn.query(
            `
            INSERT INTO json_paths (path, type, example)
            VALUES ('${path.path}', '${path.type}', ${
              path.example ? `'${path.example}'` : "NULL"
            })
          `
          );
        }

        await conn.close();
      }
    } catch (error) {
      console.error("Error processing JSON file:", error);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="file"
          accept=".json"
          onChange={handleChange}
          className="mb-4"
        />
      </div>

      {paths.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Path</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Example</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((path, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 font-mono text-sm">{path.path}</td>
                  <td className="px-4 py-2">{path.type}</td>
                  <td className="px-4 py-2 truncate max-w-xs">
                    {path.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
