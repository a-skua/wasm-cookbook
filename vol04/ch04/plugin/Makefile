.PHONY: run build clean

INPUT ?= {"price":1000,"tax_rate":10,"price_type":"tax_included"}

run: build
	extism call target/wasm32-unknown-unknown/debug/rust_pdk_template.wasm calc_tax --input '$(INPUT)'

build:
	cargo build --target wasm32-unknown-unknown

clean:
	cargo clean
