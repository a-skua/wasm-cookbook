target/wasm32-wasip2/release/filter.wasm: wit/deps src/lib.rs
	cargo build -r --target wasm32-wasip2

wit/deps: wit/world.wit
	wkg wit fetch

.PHONY: clean
clean:
	cargo clean
	rm -rf wit/deps
