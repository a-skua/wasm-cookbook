file_generate.wasm: main.go
	curl -sO https://raw.githubusercontent.com/golang/go/refs/heads/master/lib/wasm/wasm_exec.js
	GOOS=js GOARCH=wasm go build -o $@ $<

.PHONY: clean
clean:
	rm -f wasm_exec.js
	rm -f file_generate.wasm
