package main

import (
	"fmt"
)

//go:wasmimport calc add
func add(a, b int32) int32

func main() {
	const a, b int32 = 1, 2
	result := add(a, b)
	fmt.Printf("%d + %d = %d\n", a, b, result)
}
