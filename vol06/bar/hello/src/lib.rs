mod bindings {
    wit_bindgen::generate!({
        path: "wit",
        generate_all,
    });
}

use bindings::example::hello::console;
use bindings::exports::example::hello::run;

// Web(jco)での利用を想定したHello World
//
// stdoutは使わず，ホスト側が提供する`console.log`に出力する．

struct Hello;

impl run::Guest for Hello {
    fn run() {
        console::log("Hello, world!");
    }
}

bindings::export!(Hello with_types_in bindings);
