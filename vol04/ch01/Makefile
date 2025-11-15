SRC:=$(shell find . -name '*.wat')
TARGETS:=$(SRC:.wat=.wasm)

.PHONY: all
all: $(TARGETS)

%.wasm: %.wat
	wasm-tools parse $< -o $@

.PHONY: clean
clean:
	rm -f *.wasm
