.PHONY: run
run: calc/calc.wasm cmd/cmd.wasm
	wasmtime run --preload calc=$< $(word 2, $^)

calc/calc.wasm: calc/main.go
	@$(MAKE) -C calc

cmd/cmd.wasm: cmd/main.go
	@$(MAKE) -C cmd

.PHONY: clean
clean:
	@$(MAKE) -C calc clean
	@$(MAKE) -C cmd clean
