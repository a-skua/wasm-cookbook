import * as wasm from "./build/release.js";
import * as js from "./fib.js";

const n = 92;
const bigN = BigInt(n);

console.debug(`wasm(i32)  F(${n}) = ${wasm.fib(n)}`);
console.debug(`wasm(i64)  F(${bigN}) = ${wasm.fibBigN(bigN)}`);
console.debug(`js(number) F(${n}) = ${js.fib(n)}`);
console.debug(`js(bigint) F(${bigN}) = ${js.fibBigN(bigN)}`);

Deno.bench(`wasm(i32) F(${bigN})`, () => {
  wasm.fib(n);
});

Deno.bench(`wasm(i32, iterative) F(${bigN})`, () => {
  wasm.fib(n);
});

Deno.bench(`wasm(i64) F(${bigN})`, () => {
  wasm.fibBigN(bigN);
});

Deno.bench(`wasm(i64, iterative) F(${bigN})`, () => {
  wasm.fibIterativeBigN(bigN);
});

Deno.bench(`js(number) F(${n})`, () => {
  js.fib(n);
});

Deno.bench(`js(number, iterative) F(${n})`, () => {
  js.fibIterative(n);
});

Deno.bench(`js(bigint) F(${bigN})`, () => {
  js.fibBigN(bigN);
});

Deno.bench(`js(bigint, iterative) F(${bigN})`, () => {
  js.fibIterativeBigN(bigN);
});
