wit_bindgen::generate!({
    world: "calculator",
});

use exports::example::component::calculate::Guest;

struct Calculate;

impl Guest for Calculate {
    fn add(a: i32, b: i32) -> i32 {
        a + b
    }
}

export!(Calculate);
