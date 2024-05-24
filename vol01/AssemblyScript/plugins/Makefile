.PHONY: run
run: node_modules
	node .

.PHONY: run-deno
run-deno: bundle.js
	deno run $<

.PHONY: serve
serve: index.html bundle.js
	python3 -m http.server

bundle.js: node_modules
	npx esbuild --bundle \
		--external:fs \
		--external:module \
		--external:path \
		--external:url \
		--format=esm --outfile=$@ .

node_modules/:
	npm ci
