.PHONY: bench
bench: build/release.js node_modules
	deno bench --allow-read

build/release.js: assembly/index.ts
	npm run asbuild

node_modules/:
	npm ci
