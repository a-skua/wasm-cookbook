## 第4章

ブラウザ上でのWebAssemblyの実行にはFetch関数を用いるためWebサーバー，もしくはVSCodeの拡張機能であるLivePreviewを用いてください．

### 簡単な加算の関数(4.1)
```sh
cd example-go
make #ビルドと同時にwasm_exec.jsをcurlでダウンロードします．

make clean #ビルドしたファイルとダウンロードしたファイルを削除
```

### Excelファイル生成の関数(4.2~)
```sh
cd excel-wasm
make #ビルドと同時にwasm_exec.jsをcurlでダウンロードします．

make clean #ビルドしたファイルとダウンロードしたファイルを削除
```
