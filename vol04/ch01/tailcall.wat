(module
  (func $a (result i32)
    i32.const 42
  )
  (func $b (result i32)
    i32.const 1 ;; PUSH
    i32.const 2 ;; PUSH
    drop        ;; POP
    drop        ;; POP
    call $a
  )
  (func $c (result i32)
    i32.const 1 ;; PUSH
    i32.const 2 ;; PUSH
    return_call $a
  )
  (export "b" (func $b))
  (export "c" (func $c))
)
