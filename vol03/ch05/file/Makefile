.PHONY: run
run: target/wasm32-wasip2/release/file.wasm
	wasmtime run --dir . $<

target/wasm32-wasip2/release/%.wasm: src/main.rs
	cargo build -r --target wasm32-wasip2
