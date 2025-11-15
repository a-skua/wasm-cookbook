(module
  (memory $external i32 1)
  (memory $internal i32 1)
  (func $set_i32 (param $addr i32)
    (memory.copy $internal $external
      (local.get $addr) ;; to internal $addr
      (local.get $addr) ;; from external $addr
      (i32.const 4)     ;; 4 bytes = i32
    )
  )
  (func $get_i32 (param $addr i32) (result i32)
    (i32.load $internal (local.get $addr))
  )
  (export "set_i32" (func $set_i32))
  (export "get_i32" (func $get_i32))
  (export "memory" (memory $external))
)
