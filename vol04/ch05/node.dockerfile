# syntax=docker/dockerfile:1

FROM alpine:latest AS downloader

RUN apk add --no-cache wget ca-certificates && \
    wget -q https://github.com/containerd/runwasi/releases/download/containerd-shim-wasmtime%2Fv0.6.0/containerd-shim-wasmtime-x86_64-linux-musl.tar.gz && \
    tar -xzf containerd-shim-wasmtime-x86_64-linux-musl.tar.gz && \
    rm containerd-shim-wasmtime-x86_64-linux-musl.tar.gz

FROM rancher/k3s:v1.33.4-k3s1

COPY --from=downloader /containerd-shim-wasmtime-v1 /usr/local/bin/
COPY containerd-wasmtime.toml /etc/containerd/conf.d/wasmtime.toml
