## Extismでクロス言語プラグインを作成する

### プラグイン
#### ビルドと実行
```sh
cd plugin
cargo build --target wasm32-unknown-unknown
extism call target/wasm32-unknown-unknown/debug/rust_pdk_template.wasm calc_tax --input "{\"price\":1000,\"tax_rate\":10,\"price_type\":\"tax_included\"}"
```

### ホストアプリケーション
#### ビルドと実行
```sh
cd app
go run main.go input.jsonl output.jsonl
```
