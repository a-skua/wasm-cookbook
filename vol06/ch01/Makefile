USER?=world

.PHONY: run
run: filtered_hello.wasm
	wasmtime $< $(USER)

filtered_hello.wasm: filter/target/wasm32-wasip2/release/filter.wasm hello/target/wasm32-wasip2/release/hello.wasm
	wac plug --plug $^ -o $@

filter/target/wasm32-wasip2/release/filter.wasm:
	$(MAKE) -C filter

hello/target/wasm32-wasip2/release/hello.wasm:
	$(MAKE) -C hello

.PHONY: clean
clean:
	rm -f filtered_hello.wasm
	$(MAKE) -C filter clean
	$(MAKE) -C hello clean
