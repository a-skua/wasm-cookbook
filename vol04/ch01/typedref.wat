(module
  (type $point (struct (field $x f64) (field $y f64)))
  (func $point_new (param $x f64) (param $y f64) (result (ref null $point))
    (ref.null $point)
  )
  (export "point_new" (func $point_new))
)
