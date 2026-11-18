dist/hello.js: target/wasm32-wasip2/release/hello.wasm
	npx jco transpile --no-nodejs-compat --no-wasi-shim -o $(dir $@) $<

target/wasm32-wasip2/release/hello.wasm: src/lib.rs
	cargo build -r --target wasm32-wasip2

.PHONY: serve
serve: dist/hello.js
	deno run -NR=. jsr:@std/http/file-server

.PHONY: clean
clean:
	cargo clean
	rm -rf dist
