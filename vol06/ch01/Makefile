USER?=world

filtered_hello.wasm: filter/target/wasm32-wasip2/release/filter.wasm hello/target/wasm32-wasip2/release/hello.wasm
	wac plug --plug $^ -o $@

filter/target/wasm32-wasip2/release/filter.wasm:
	$(MAKE) -C filter

hello/target/wasm32-wasip2/release/hello.wasm:
	$(MAKE) -C hello

.PHONY: run
run: filtered_hello.wasm
	wasmtime $< $(USER)

.PHONY: clean
clean:
	rm -f filtered_hello.wasm
	$(MAKE) -C filter clean
	$(MAKE) -C hello clean
