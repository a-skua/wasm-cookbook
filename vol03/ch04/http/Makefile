SRC := $(shell find src -name "*.rs")
WIT := $(shell find wit -name "*.wit")

.PHONY: all
all: target/wasm32-wasip2/release/http.wasm

target/wasm32-wasip2/release/%.wasm: $(SRC) $(WIT)
	cargo build -r --target wasm32-wasip2
