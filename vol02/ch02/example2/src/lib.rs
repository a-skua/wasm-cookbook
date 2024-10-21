#[allow(warnings)]
mod bindings;

use bindings::{vscode::example::vscode, Guest};

struct Example;

impl Guest for Example {
    fn run() {
        vscode::show_information_message("Hello from Rust!");
    }
}

bindings::export!(Example with_types_in bindings);
