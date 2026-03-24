default: target/wasm32-wasip1/release/wasm_filter.wasm

target/wasm32-wasip1/release/wasm_filter.wasm: src/lib.rs
	cargo build --release --target wasm32-wasip1

setup-hydra:
	docker compose exec hydra \
		hydra create oauth2-client \
		--endpoint http://localhost:4445 \
		--id test-client \
		--secret test-secret \
		--grant-type client_credentials \
		--scope core:read

token:
	docker compose exec hydra \
		hydra perform client-credentials \
		--endpoint http://localhost:4444 \
		--client-id test-client \
		--client-secret test-secret \
		--scope core:read

.PHONY: setup-hydra token
