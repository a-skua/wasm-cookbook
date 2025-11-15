const { instance } = await WebAssembly.instantiateStreaming(
  fetch(new URL("./jsstring.wasm", import.meta.url)),
  {},
  { builtins: ["js-string"] },
);

console.log(instance.exports.length("hello, world!")); // 13
