import { get_i32, memory, set_i32 } from "./multimemory.wasm";

const addr = 100;
const mem = new DataView(memory.buffer);

// メモリに値を設定
mem.setInt32(addr, 42, true);
set_i32(addr);
console.log(get_i32(addr)); // 42

// メモリから値を取得
mem.setInt32(addr, 0, true); // 値をクリア
console.log(get_i32(addr)); // 42
