# `run`は同期関数だが，内部で`block_on`によりホストの`fetch`(Promise)を待つため，
# JSPI(JavaScript Promise Integration)を有効にしてtranspileする．
# また，WASIのimportを含むため`--no-wasi-shim`は付けずpreview2-shimを利用する．
dist/fetch.js: target/wasm32-wasip2/release/fetch.wasm node_modules
	npx jco transpile --async-mode jspi --async-exports 'example:fetch/run@2026.11.21#run' -o $(dir $@) $<

target/wasm32-wasip2/release/fetch.wasm: src/lib.rs wit/world.wit
	cargo build -r --target wasm32-wasip2

node_modules: package.json package-lock.json
	npm ci

.PHONY: serve
serve: dist/fetch.js
	deno run -NR=. jsr:@std/http/file-server

.PHONY: clean
clean:
	cargo clean
	rm -rf dist node_modules
