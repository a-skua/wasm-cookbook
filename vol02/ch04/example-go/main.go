package main

import (
	"syscall/js"
)

func main() {
	c := make(chan struct{})
	js.Global().Set("add", js.FuncOf(add))
	<-c
}

func add(this js.Value, args []js.Value) interface{} {
	return js.ValueOf(args[0].Int() + args[1].Int())
}
