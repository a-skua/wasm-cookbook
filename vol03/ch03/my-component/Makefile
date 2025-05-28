WIT := $(shell find wit -name "*.wit")
SRC := $(shell find src -name "*.rs")

.PHONY: all
all: target/wasm32-wasip2/release/my_component.wasm

target/wasm32-wasip2/release/%.wasm: $(SRC) $(WIT)
	cargo build -r --target wasm32-wasip2

.PHONY: clean
clean:
	cargo clean
