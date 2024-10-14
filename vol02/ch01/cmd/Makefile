cmd.wasm: main.go
	GOOS=wasip1 GOARCH=wasm go build -o $@ $<

.PHONY: clean
clean:
	rm -f cmd.wasm
