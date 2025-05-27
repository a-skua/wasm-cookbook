.PHONY: run
run: target/wasm32-wasip2/release/env.wasm
	wasmtime run --env FOO=hoge --env BAR=fuga $<

target/wasm32-wasip2/release/env.wasm: src/main.rs
	cargo build -r --target wasm32-wasip2
