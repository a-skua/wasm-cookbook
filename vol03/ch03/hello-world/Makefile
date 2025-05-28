SRC := $(shell find src -name "*.rs")

.PHONY: run
run: target/wasm32-wasip2/release/hello-world.wasm
	wasmtime run $<

target/wasm32-wasip2/release/%.wasm: $(SRC)
	cargo build -r --target wasm32-wasip2
