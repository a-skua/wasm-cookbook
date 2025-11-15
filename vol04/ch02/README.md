## TinyGoでWasmを実装し，AIエージェントで利用する

### プレビュー1

e.g. Go
```sh
cd hello

# GOOS=wasip1 GOARCH=wasm go build -o hello.wasm hello.go
make hello.wasm
```

e.g. TinyGo
```sh
cd hello

# GOOS=wasip1 GOARCH=wasm tinygo build -o hello_p1.wasm hello.go
make hello_p1.wasm
```

### プレビュー2

```sh
cd hello

# GOOS=wasip2 GOARCH=wasm tinygo build -o hello_p2.wasm hello.go
make hello_p2.wasm
```

### wasi:http/proxy

```sh
cd http-proxy

# tinygo build --target=wasip2 --no-debug --wit-package wit --wit-world proxy -o proxy.wasm proxy.go
make proxy.wasm
```

### Wasmコンポーネント実装

```sh
cd calc

# go tool wit-bindgen-go generate --out internal/gen wit/
# tinygo build --target=wasip2 --no-debug --wit-package wit --wit-world calc -o calc.wasm calc.go
make
```
