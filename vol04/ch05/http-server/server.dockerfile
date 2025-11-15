# syntax=docker/dockerfile:1

# NOTE: この Dockerfile は各種測定用に利用したコンテナ Image をビルドするためのものです.
#       Wasm Image を利用する場合は Docker build ではなく, wkg コマンドで oci image を push して利用してください.

FROM rust:1.90 AS build
RUN rustup target add x86_64-unknown-linux-musl
RUN apt-get update -y && apt-get install musl-tools -y

RUN cargo install --target="x86_64-unknown-linux-musl" wasmtime-cli@37.0.2

RUN cp $(which wasmtime) /wasmtime

FROM scratch AS wasmtime

COPY --from=build /wasmtime /wasmtime
COPY ./target/wasm32-wasip2/release/http_server.wasm /http_server.wasm

ENTRYPOINT [ "/wasmtime", "serve", "-S", "cli", "/http_server.wasm" ]
