.PHONY: build
build: calc.wasm

.PHONY: push
push: calc.wasm
	wkg oci push askua9/calc:cookbook-vol4-example $<

%.wasm: %.go internal/gen
	tinygo build --target=wasip2 --no-debug \
		--wit-package wit --wit-world $* \
		-o $@ $<

internal/gen: ./wit/world.wit wit/deps
	@rm -rf $@
	go tool wit-bindgen-go generate --out $@ $(dir $<)

wit/deps: wit/world.wit
	wkg wit fetch
