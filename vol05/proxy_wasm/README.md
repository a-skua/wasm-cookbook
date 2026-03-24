## Proxy-Wasm による Envoy 拡張実装

### 利用技術

- [Proxy-Wasm](https://github.com/proxy-wasm)
- [Envoy Proxy](https://www.envoyproxy.io/)

### Wasm ビルド

```bash
make
```

### アクセストークン発行

各コマンドの詳細については Makefile を参照ください.

```bash
docker compose up --detach
make setup-hydra
make token
```

以下のような出力が得られます. 最初の行が利用するアクセストークンです.

```
ACCESS TOKEN    ory_at_xxxxx...
REFRESH TOKEN   <empty>
ID TOKEN        <empty>
EXPIRY          20xx-xx-xx xx:xx:xx +0000 UTC
```

### 動作検証

#### 正常動作

```bash
# 正規のアクセストークン付与
curl http://localhost:10000 -H "Authorization: Bearer ory_at_xxxxx..."
```

#### 失敗動作

```bash
# 認証ヘッダなし
curl http://localhost:10000

# 不正トークン付与
curl http://localhost:10000 -H "Authorization: Bearer Invalid"

# 認証方式が異なる
curl http://localhost:10000 -H "Authorization: Basic dXNlcl9pZDpwYXNzd29yZAo="
```

#### メトリクス取得

```bash
curl -s http://localhost:9901/stats
```

### クリーンアップ

```bash
docker compose down --volumes
```