package main

import (
    "example.com/calc/internal/gen/cookbook/example/calculator"
)

func add(a int32, b int32) int32 { return a + b }
func sub(a int32, b int32) int32 { return a - b }
func mul(a int32, b int32) int32 { return a * b }
func div(a int32, b int32) int32 { return a / b }

func init() {
    calculator.Exports.Add = add
    calculator.Exports.Sub = sub
    calculator.Exports.Mul = mul
    calculator.Exports.Div = div
}

func main() {}
