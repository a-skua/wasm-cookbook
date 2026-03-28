[packages.gsutil]
path = "target/wasm32-wasip2/release/compose_gsutil.wasm"

[packages.gsutil.run]
wasi = ["http"]
dirs = [".", "<?=getenv("HOME")?>/.config/gcloud/"]
env = ["HOME"]
