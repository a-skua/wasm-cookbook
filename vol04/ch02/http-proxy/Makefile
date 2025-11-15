.PHONY: serve
serve: proxy.wasm
	wasmtime serve -S cli $<

%.wasm: %.go
	tinygo build --target=wasip2 --no-debug \
		--wit-package wit --wit-world $* \
		-o $@ $<

wit/deps: wit/world.wit
	wkg wit fetch

.PHONY: clean
clean:
	rm -f *.wasm
