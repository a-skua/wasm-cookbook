.PHONY: run
run:
	$(MAKE) -C web

web/__dart/workers.wasm: bin/workers.dart
	dart compile wasm --output=$@ $<
