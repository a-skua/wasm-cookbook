mod bindings {
    wit_bindgen::generate!({
        path: "wit",
        generate_all,
    });
}

use bindings::example::fetch::{console, fetch};
use bindings::exports::example::fetch::run;

struct Fetch;

impl run::Guest for Fetch {
    fn run(url: String) {
        wit_bindgen::block_on(async {
            match fetch::fetch(&url).await {
                Ok(res) => {
                    console::log(&format!("status: {}", res.status()));
                    console::log(&res.text().await);
                }
                Err(()) => console::log(&format!("failed to fetch: {url}")),
            }
        });
    }
}

bindings::export!(Fetch with_types_in bindings);
