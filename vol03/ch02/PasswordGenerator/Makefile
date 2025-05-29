.PHONY: run
run: .build
	npx serve

.build: Sources/main.swift
	swift package --swift-sdk 6.1-RELEASE-wasm32-unknown-wasi js --use-cdn
