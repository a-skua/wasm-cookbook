(module
  (func $start (result i32)
    (i8x16.relaxed_swizzle
      (v128.const i8x16 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16)
      (v128.const i8x16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0)
    )
    (i8x16.extract_lane_s 0)
  )
  (export "_start" (func $start))
)
