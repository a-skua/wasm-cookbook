import { _start, table } from "./memory64.wasm";

console.log(_start()); // 65536

console.log(table.get(0n)?.()); // undefined

table.set(1n, () => 100);
console.log(table.get(1n)?.()); // 100
