import { defineConfig } from "vite";

// ゲーム（index.html）と性能比較（bench.html）の2ページをビルドする
export default defineConfig({
  input: {
    main: "index.html",
    bench: "bench.html",
  },
});
