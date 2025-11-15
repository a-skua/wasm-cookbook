.PHONY: all
all: hello.wasm hello_p1.wasm hello_p2.wasm

%.wasm: %.go
	GOOS=wasip1 GOARCH=wasm go build -o $@ $<

%_p1.wasm: %.go
	GOOS=wasip1 GOARCH=wasm tinygo build -o $@ $<

%_p2.wasm: %.go
	GOOS=wasip2 GOARCH=wasm tinygo build -o $@ $<

.PHONY: clean
clean:
	rm -f *.wasm
