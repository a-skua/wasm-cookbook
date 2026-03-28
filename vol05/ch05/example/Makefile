WORLD := greeter
SRC := $(shell find . -name '*.go')
WIT := $(shell find wit -name '*.wit')

.PHONY: build
build: bin/example.wasm

bin/example.wasm: internal/gen $(SRC)
	@mkdir -p bin
	tinygo build -target=wasip2 -wit-package wit -wit-world $(WORLD) -o $@ .

internal/gen: wit/deps $(WIT)
	go tool wit-bindgen-go generate --world $(WORLD) --out $@ wit

wit/deps: wit/*.wit
	wkg wit fetch

.PHONY: clean
clean:
	rm -rf bin internal/gen wit/deps
