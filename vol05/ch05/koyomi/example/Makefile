SRC := $(shell find src -name "*.rs")
CONFIG := Cargo.toml Cargo.lock
WIT := $(shell find wit -name "*.wit")

TARGET := wasm32-wasip2
RELEASE_BUILD := target/$(TARGET)/release/koyomi-example.wasm
DATE := $(shell date -I)

.PHONY: run
run: init build
	wa run convert -s $(DATE) 2> /dev/null

.PHONY: build
build: bin/convert.wasm

.PHONY: init
init: wasm-pkg-runner.toml

.PHONY: clean
clean:
	rm -rf bin deps target wit/deps

wit/deps: wkg.toml wit/*.wit
	wkg wit fetch

deps/example/koyomi.wasm: ../bin/koyomi.wasm
	@mkdir -p $(dir $@)
	cp $< $@

deps/example/koyomi-app.wasm: $(RELEASE_BUILD)
	@mkdir -p $(dir $@)
	cp $< $@

bin/convert.wasm: compose.wac deps/example/koyomi.wasm deps/example/koyomi-app.wasm
	@mkdir -p $(dir $@)
	wac compose compose.wac -o $@

$(RELEASE_BUILD): wit/deps $(CONFIG) $(SRC) $(WIT)
	cargo build --release --target $(TARGET)
