## TypeScriptからWasm版Rapierを使ってブラウザゲームを作る

- [Rapier](https://rapier.rs/)
- [Matter.js](https://brm.io/matter-js/)
- [Vite](https://vite.dev/)
- [pnpm](https://pnpm.io/)

※ Node.js 26.13.0，pnpm 12.16.1で動作を確認しています．

### セットアップ

```sh
cd drop-puzzle
pnpm install
```

### 落ち物パズル

```sh
pnpm dev
```

http://localhost:5173 にアクセスし，キャンバスをクリックすると玉が落ちてきます．
同じ大きさの玉がぶつかると合体し，玉が上部の線を越えて積み上がるとゲームオーバーです．
ゲームオーバー後にキャンバスをクリックするとリスタートします．

### 物理エンジンの性能比較

本書の計測は，ビルドしたページで行っています．

```sh
pnpm build
pnpm preview
```

http://localhost:4173/bench.html にアクセスし，エンジンと玉の数を選んで「開始」を押してください．
1ステップあたりの計算時間とfpsが表示されます．

| エンジン | パッケージ |
| --- | --- |
| Matter.js（JavaScript） | `matter-js` |
| Rapier（Wasm） | `@dimforge/rapier2d-compat` |
| Rapier（Wasm + SIMD） | `@dimforge/rapier2d-simd-compat` |

クエリパラメーターでエンジン（`matter` / `rapier` / `rapier-simd`）と玉の数を指定すると，ページを開いてすぐに計測を始めます．

```
http://localhost:4173/bench.html?engine=rapier-simd&n=2000
```
