import * as duckdb from "@duckdb/duckdb-wasm";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";

import customers from "/customers-10000.csv?url";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

const queryInput = document.getElementById("query") as HTMLTextAreaElement;
const resultDiv = document.getElementById("result") as HTMLDivElement;
const executeDOMButton = document.getElementById(
  "exec_dom",
) as HTMLButtonElement;
const executeConsoleButton = document.getElementById(
  "exec_con",
) as HTMLButtonElement;
const executeBenchmarkButton = document.getElementById(
  "exec_bench",
) as HTMLButtonElement;

let db: duckdb.AsyncDuckDB;
let connection: duckdb.AsyncDuckDBConnection;

async function initDB() {
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  // Instantiate the asynchronus version of DuckDB-wasm
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db_ = new duckdb.AsyncDuckDB(logger, worker);
  await db_.instantiate(bundle.mainModule, bundle.pthreadWorker);

  try {
    const response = await fetch(customers);
    const csvText = await response.text();
    await db_.registerFileText(customers, csvText);

    db = db_;
    connection = await db.connect();

    await connection.query(
      `CREATE OR REPLACE TEMP TABLE customers AS SELECT * FROM read_csv_auto('/customers-2000000.csv');`,
    );
  } catch (e) {
    console.error(e);
  }

  console.log("DuckDB-Wasm initialized.");
}

async function executeQueryDOM() {
  const query = queryInput.value;
  resultDiv.innerHTML = "実行中...";

  try {
    const result = await connection.query(query);
    if (result && result.numRows > 0) {
      const fields = result.schema.fields;
      const results = result.toArray();

      let output = "<table><thead><tr>";
      fields.map((v) => {
        output += `<th>${v.name}</th>`;
      });
      output += "</tr></thead><tbody>";
      results.map((r) => {
        output += "<tr>";
        const row = r.toJSON();
        Object.values(row).map((v) => {
          output += `<td>${v}</td>`;
        });
        output += "</tr>";
      });
      output += "</tbody></table>";
      resultDiv.innerHTML = output;
    } else if (result && result.numRows === 0) {
      resultDiv.innerHTML = "クエリは結果を返しませんでした。";
    } else {
      resultDiv.innerHTML = "クエリを実行しました。";
    }
  } catch (e) {
    console.error(e);
  }
}

async function executeQueryConsole() {
  const query = queryInput.value;
  console.debug(query);
  console.log("実行中...");

  try {
    const startTime = performance.now();
    const result = await connection.query(query);
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    console.log(`DuckDB: Queried (${result.numRows} rows) in ${queryTime} ms.`);
    if (result && result.numRows > 0) {
      const results = result.toArray();
      console.log(results.map((v) => v.toJSON()));
    } else if (result && result.numRows === 0) {
      console.log("クエリは結果を返しませんでした。");
    } else {
      console.log("クエリを実行しました。");
    }
  } catch (e) {
    console.error(e);
  }
}

async function executeBenchmark() {
  console.log("DuckDB Benchmark Start...");

  const numRows = 100000;
  const tableName = "test_data";

  // データ生成
  const data = Array.from({ length: numRows }, (_, i) => ({
    id: i,
    value: Math.random() * 100,
  }));

  // テーブル作成とデータ挿入
  let startTime = performance.now();
  await connection.query(`CREATE TABLE ${tableName} (id INTEGER, value REAL);`);
  const insertStatement = await connection.prepare(
    `INSERT INTO ${tableName} VALUES (?, ?);`,
  );
  for (const row of data) {
    await insertStatement.query(row.id, row.value);
  }
  await insertStatement.close();
  let endTime = performance.now();
  const insertTime = endTime - startTime;
  console.log(`DuckDB: Inserted ${numRows} rows in ${insertTime} ms.`);

  // クエリ実行
  const threshold = 50;
  startTime = performance.now();
  const result = await connection.query(
    `SELECT * FROM ${tableName} WHERE value > ${threshold};`,
  );
  endTime = performance.now();
  const queryTime = endTime - startTime;
  console.log(`DuckDB: Queried (${result.numRows} rows) in ${queryTime} ms.`);

  console.log("DuckDB Benchmark End.");
}

initDB();
executeDOMButton.addEventListener("click", executeQueryDOM);
executeConsoleButton.addEventListener("click", executeQueryConsole);
executeBenchmarkButton.addEventListener("click", executeBenchmark);
