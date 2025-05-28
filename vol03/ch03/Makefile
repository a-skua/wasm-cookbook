.PHONY: run
run: plugged.wasm
	wasmtime run $<

plugged.wasm: use-component/target/wasm32-wasip2/release/use-component.wasm my-component/target/wasm32-wasip2/release/my_component.wasm
	wac plug $< --plug $(word 2,$^) -o $@

use-component/target/wasm32-wasip2/release/use-component.wasm:
	$(MAKE) -C use-component 

my-component/target/wasm32-wasip2/release/my_component.wasm:
	$(MAKE) -C my-component
