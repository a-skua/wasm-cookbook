## WebAssembly on Kubernetes

- [Docker](https://docs.docker.com/get-docker/)
- [k3d](https://k3d.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- [wasm-pkg-tools (wkg)](https://github.com/bytecodealliance/wasm-pkg-tools)

## ノードイメージ構築

```sh
make k3d_node
```

## クラスタ構築

```sh
make cluster
```

## サンプルサーバのビルド

```sh
cd http-server
cargo build --target wasm32-wasip2 --release
```

## OCI イメージのビルドとプッシュ

```sh
cd http-server
wkg oci push <NAMESPACE>/<IMAGE_NAME>[:<TAG>] target/wasm32-wasip2/release/http-server.wasm
```

## Wasm ワークロードのデプロイ

```sh
# Edit manifests/wasm-deployment.yml to set your image
kubectl apply -f manifests/wasm-deployment.yml
```

## Wasm + Container ワークロードのデプロイ

```sh
# Edit manifests/wasm-with-container.yml to set your image
kubectl apply -f manifests/wasm-with-container.yml
```

## クラスタ破棄

```sh
make destroy
```
