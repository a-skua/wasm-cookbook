.PHONY: serve
serve: index.js __dart/workers.wasm node_modules
	npx wrangler dev

__dart/workers.wasm:
	make -C .. web/$@

node_modules/:
	npm ci
