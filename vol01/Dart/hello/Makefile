SRC := $(shell find lib -name "*.dart")

.PHONY: run
run: web/index.js web/__dart/hello.wasm
	deno run --allow-read $<

web/__dart/hello.wasm: bin/hello.dart $(SRC)
	dart compile wasm --output=$@ $<
