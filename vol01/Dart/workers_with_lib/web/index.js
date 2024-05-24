import { instantiate, invoke } from "./__dart/workers.mjs";
import module from "./__dart/workers.wasm";

export default {
  async fetch(request) {
    const instance = await instantiate(module);

    let response;
    globalThis.__dart_cf_workers = {
      request: () => request,
      response: (r) => response = r,
    };
    await invoke(instance);

    return response;
  },
};
