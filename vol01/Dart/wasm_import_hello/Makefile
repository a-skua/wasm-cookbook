.PHONY: run
run: web/index.js web/__dart/hello.wasm
	deno run --allow-read $<

web/__dart/hello.wasm: bin/hello.dart
	dart compile wasm --output=$@ $<
