.PHONY: run
run: target/wasm32-wasip2/release/http.wasm
	wasmtime serve -S cli $<

target/wasm32-wasip2/release/%.wasm: src/lib.rs
	cargo build -r --target wasm32-wasip2
