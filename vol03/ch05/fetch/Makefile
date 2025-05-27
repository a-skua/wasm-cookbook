.PHONY: run
run: target/wasm32-wasip2/release/fetch.wasm
	wasmtime run -S http $<

target/wasm32-wasip2/release/%.wasm: src/main.rs
	cargo build -r --target wasm32-wasip2
