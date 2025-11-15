package main

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"

	extism "github.com/extism/go-sdk"
)

const wasmPath = "../plugin/target/wasm32-unknown-unknown/debug/rust_pdk_template.wasm"

func main() {
	in, err := os.Open(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open input: %v\n", err)
		os.Exit(1)
	}
	defer in.Close()

	out, err := os.Create(os.Args[2])
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to create output: %v\n", err)
		os.Exit(1)
	}
	defer out.Close()

	manifest := extism.Manifest{
		Wasm: []extism.Wasm{
			extism.WasmFile{
				Path: wasmPath,
			},
		},
	}

	ctx := context.Background()
	config := extism.PluginConfig{}
	// プラグインの読み込み
	plugin, err := extism.NewPlugin(ctx, manifest, config, nil)

	if err != nil {
		fmt.Printf("Failed to initialize plugin: %v\n", err)
		os.Exit(1)
	}
	defer plugin.Close(ctx)

	sc := bufio.NewScanner(in)
	w := bufio.NewWriter(out)
	defer w.Flush()

	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		// エクスポートされた関数を呼び出し
		_, res, err := plugin.Call("calc_tax", []byte(line))
		if err != nil {
			fmt.Fprintln(os.Stderr, "plugin error:", err)
			continue
		}
		w.Write(res)
		w.WriteByte('\n')
	}
	if err := sc.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "read error:", err)
	}
}
