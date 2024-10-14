package main

import (
	"fmt"
)

//go:wasmexport add
func add(a, b int32) int32 {
	return a + b
}

func init() {
	fmt.Println("call init")
}

func main() {
	fmt.Println("call main")
}
