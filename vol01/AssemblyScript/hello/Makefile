.PHONY: run
run: build/release.wasm node_modules
	deno run --allow-read index.js

.PHONY: serve-node node_modules
serve-node: build/release.wasm
	node .

build/release.wasm: assembly/index.ts
	npm run asbuild

node_modules/:
	npm ci
