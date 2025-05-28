## wasm-pkg-tools

- [wasm-pkg-tools (wkg)](https://github.com/bytecodealliance/wasm-pkg-tools)

### Docker Hub上にコンポーネントを公開

```sh
cd http
make
wkg oci push <NS>/<NAME>[:<TAG>] target/wasm32-wasip2/release/http.wasm
```

### Docker Hub上のコンポーネントを取得

```sh
wkg oci pull <NS>/<NAME>[:<TAG>]
```

### WITの依存解決

```sh
cd http
wkg wit fetch
```
