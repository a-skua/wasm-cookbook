package main

import (
	"bytes"
	"fmt"
	"syscall/js"

	"github.com/xuri/excelize/v2"
)

func main() {
	c := make(chan struct{})
	js.Global().Set("fileGenerate", js.FuncOf(fileGenerate))
	<-c
}

func fileGenerate(this js.Value, args []js.Value) interface{} {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println(err)
		}
	}()
	f.SetCellValue("Sheet1", "A1", args[0].String())

	dst := convertToUint8Array(f)

	return js.ValueOf(dst)
}

func convertToUint8Array(f *excelize.File) js.Value {
	buf := new(bytes.Buffer)
	f.Write(buf)

	src := buf.Bytes()
	dst := js.Global().Get("Uint8Array").New(len(src))
	js.CopyBytesToJS(dst, src)

	return dst
}
