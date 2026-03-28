NAME := $(shell cargo metadata --format-version=1 --no-deps | jq -r '.packages[0].name').wasm

.PHONY: run
run: target/wasm32-wasip2/release/$(NAME)
	wasmtime run $<

.PHONY: clean
clean:
	cargo clean

target/%/release/$(NAME): $(SRC) Cargo.toml
	cargo build --release --target $*
