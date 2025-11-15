(module
  (memory $memory i64 1)                 ;; 64-bit address space
  (table $table i64 2 (ref null extern)) ;; 64-bit address space

  (func $start (result i32)
    (i32.store offset=1
      (i64.const 100) ;; 64-bit address
      (i32.const 256)
    )
    (i32.load offset=0
      (i64.const 100) ;; 64-bit address
    )
  )
  (export "_start" (func $start))
  (export "memory" (memory $memory))
  (export "table" (table $table))
)
