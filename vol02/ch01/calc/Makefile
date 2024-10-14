calc.wasm: main.go
	GOOS=wasip1 GOARCH=wasm go build -buildmode=c-shared -o $@ $<

.PHONY: clean
clean:
	rm -f calc.wasm
