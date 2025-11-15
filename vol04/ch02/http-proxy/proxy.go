package main

import (
	"fmt"
	"net/http"

	"github.com/a-skua/go-wasi/http/proxy"
)

func init() {
	proxy.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		fmt.Fprintln(w, "Hello, 世界!")
	})
}

func main() {}
