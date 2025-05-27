## Wasm 入門 - 実行プログラムを配布して安全に実行する

- [Rust](https://www.rust-lang.org/tools/install)
- [wasmtime](https://github.com/bytecodealliance/wasmtime)
- [wasm-pkg-tools (wkg)](https://github.com/bytecodealliance/wasm-pkg-tools)
- [wasmCloud](https://wasmcloud.com/docs/tour/hello-world/)

### 環境変数の読み込み

```sh
cd env
make
```

### ファイル内容の表示

```sh
cd file
make
```

### ネットワークアクセス

```sh
cd fetch
make
```

### Wasmを使ったウェブサーバーの実装

```sh
cd http
make
```

### wasmCloudを利用したウェブサーバーの起動

```sh
wash app deploy wadm.yaml
```
