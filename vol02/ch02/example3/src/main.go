package main

import (
	. "example.com/example/src/gen"
)

type example struct{}

func (example) Run() {
	VscodeExampleVscodeShowInformationMessage("Hello, 世界!")
}

func init() {
	example := example{}
	SetExample(example)
}

//go:generate wit-bindgen tiny-go --out-dir=gen ../wit
func main() {}
