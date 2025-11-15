NODE_IMAGE := k3s-wasm-node:v1.33.4-k3s1
CLUSTER_NAME := wasmtime-cluster

.PHONY: k3d_node cluster destroy
k3d_node:
	docker build -f node.dockerfile -t ${NODE_IMAGE} .

cluster:
	k3d cluster create ${CLUSTER_NAME} -i ${NODE_IMAGE} -a 2
	kubectl apply -f manifests/runtime.yml

destroy:
	k3d cluster delete ${CLUSTER_NAME}

