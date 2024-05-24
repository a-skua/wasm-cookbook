const map = new Map<i32, i32>();

export function fib(n: i32): i32 {
  if (n <= 1) {
    return n;
  }

  if (map.has(n)) {
    return map.get(n);
  }

  const result = fib(n - 1) + fib(n - 2);
  map.set(n, result);
  return result;
}

export function fibIterative(n: i32): i32 {
  if (n <= 1) {
    return n;
  }

  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

const mapBigN = new Map<i64, i64>();

export function fibBigN(n: i64): i64 {
  if (n <= 1) {
    return n;
  }

  if (mapBigN.has(n)) {
    return mapBigN.get(n);
  }

  const result = fibBigN(n - 1) + fibBigN(n - 2);
  mapBigN.set(n, result);
  return result;
}

export function fibIterativeBigN(n: i64): i64 {
  if (n <= 1) {
    return n;
  }

  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}
