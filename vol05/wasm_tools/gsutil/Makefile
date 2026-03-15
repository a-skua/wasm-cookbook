NAME := $(shell cargo metadata --format-version=1 --no-deps | jq -r '.packages[0].name').wasm

AUTH_WASM_REF := ghcr.io/a-skua/gcloud/auth:0.3.0-component
AUTH_WASM := target/wasm32-wasip2/release/gcloud_auth_0_3_0.wasm
STORAGE_WASM_REF := ghcr.io/a-skua/gcloud/storage:0.3.0-component
STORAGE_WASM := target/wasm32-wasip2/release/gcloud_storage_0_3_0.wasm

.PHONY: run
run: target/wasm32-wasip2/release/compose_$(NAME)
	wa run gsutil -h

.PHONY: init
init: wasm-pkg-runner.toml

.PHONY: build
build: target/wasm32-wasip2/release/$(NAME)

.PHONY: clean
clean:
	cargo clean

$(AUTH_WASM):
	wkg oci pull -o $@ $(AUTH_WASM_REF)

$(STORAGE_WASM):
	wkg oci pull -o $@ $(STORAGE_WASM_REF)

%: %.php
	php $< > $@

target/%/release/$(NAME): $(SRC) Cargo.toml
	cargo build --release --target $*

target/%/release/compose_$(NAME): compose.wac target/%/release/$(NAME) $(AUTH_WASM) $(STORAGE_WASM)
	wac compose $< \
		-d "example:gsutil=$(word 2,$^)" \
		-d "gcloud:auth=$(word 3,$^)" \
		-d "gcloud:storage=$(word 4,$^)" \
		-o $@
