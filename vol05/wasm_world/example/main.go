package main

import (
	"example.com/example/internal/gen/cookbook/example/action"
	"fmt"
)

func greet(name string) (result string) {
	return fmt.Sprintf("Hello, %s!", name)
}

func init() {
	action.Exports.Greet = greet
}

func main() {}
