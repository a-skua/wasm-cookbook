USER?=world

target/wasm32-wasip2/release/hello.wasm: src/main.rs
	cargo build -r --target wasm32-wasip2

.PHONY: run
run: target/wasm32-wasip2/release/hello.wasm
	wasmtime run $< $(USER)

.PHONY: clean
clean:
	cargo clean
