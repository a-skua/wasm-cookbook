import { point_get_x, point_get_y, point_new } from "./gc.wasm";

const p = point_new(10.5, 20.0);
const x = point_get_x(p);
const y = point_get_y(p);
console.log(`p(${x}, ${y})`); // p(10.5, 20)
