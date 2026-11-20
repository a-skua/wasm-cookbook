dist/hello.js: target/wasm32-wasip2/release/hello.wasm node_modules
	npx jco transpile --no-nodejs-compat --no-wasi-shim -o $(dir $@) $<

target/wasm32-wasip2/release/hello.wasm: src/lib.rs
	cargo build -r --target wasm32-wasip2

node_modules: package.json package-lock.json
	npm ci

.PHONY: serve
serve: dist/hello.js
	deno run -NR=. jsr:@std/http/file-server

.PHONY: clean
clean:
	cargo clean
	rm -rf dist node_modules
