import { instantiate, invoke } from "./__dart/workers.mjs";
import module from "./__dart/workers.wasm";

export default {
  async fetch() {
    const instance = await instantiate(module);

    let responseBody;
    globalThis.__dart = {
      responseBody: (b) => responseBody = b,
    };
    invoke(instance);

    return new Response(responseBody);
  },
};
