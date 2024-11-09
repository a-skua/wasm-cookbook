.PHONY: build
build:
	go generate ./...
	npx wit2ts --outDir ./src ./wit
	npm run compile
