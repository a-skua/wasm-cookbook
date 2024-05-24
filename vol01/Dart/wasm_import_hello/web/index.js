import { instantiate, invoke } from "./__dart/hello.mjs";

const module = await WebAssembly.compileStreaming(
  fetch(new URL("./__dart/hello.wasm", import.meta.url)),
);

const instance = await instantiate(module, {
  __dart: {
    calculate: () => 100,
  },
});

invoke(instance);
