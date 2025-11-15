(module
  (import "wasm:js-string" "length"
    (func $string_length (param externref) (result i32))
  )
  (func $length (param $string externref) (result i32)
    (call $string_length (local.get $string))
  )
  (export "length" (func $length))
)
