(module
  (tag $exception)
  (func $start (result i32)
    (block $catch_all
      (try_table (result i32)
        (catch_all $catch_all)
        ;; (throw $exception)
        (i32.const 42)
      )
      return
    )
    (return (i32.const -1))
  )
  (export "_start" (func $start))
)
