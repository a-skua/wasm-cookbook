## RustのWASI 0.2サポート

- [wasm-tools](https://github.com/bytecodealliance/wasm-tools)
- [WebAssembly Compositions (WAC)](https://github.com/bytecodealliance/wac)

### Hello, World!

```sh
cd hello-world
make
```

### Wasmコンポーネントのインターフェース実装

```sh
cd my-component
make
wasm-tools component wit target/wasm32-wasip2/release/my_component.wasm
```

### Wasmコンポーネントを利用したWasmコンポーネント実装

```sh
cd use-component
make
wasm-tools component wit target/wasm32-wasip2/release/use-component.wasm
```

### Wasmコンポーネントの実行

```sh
make
```
