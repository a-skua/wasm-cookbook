const map = new Map();

export function fib(n) {
  if (n <= 1) return n;

  if (map.has(n)) return map.get(n);

  const result = fib(n - 1) + fib(n - 2);
  map.set(n, result);
  return result;
}

export function fibIterative(n) {
  if (n <= 1) return n;

  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

const mapBigN = new Map();

export function fibBigN(n) {
  if (n <= 1n) {
    return n;
  }

  if (mapBigN.has(n)) {
    return mapBigN.get(n);
  }

  const result = fibBigN(n - 1n) + fibBigN(n - 2n);
  mapBigN.set(n, result);
  return result;
}

export function fibIterativeBigN(n) {
  if (n <= 1n) {
    return n;
  }

  let a = 0n;
  let b = 1n;
  for (let i = 2n; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}
