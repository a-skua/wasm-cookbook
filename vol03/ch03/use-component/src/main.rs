wit_bindgen::generate!({
    world: "host",
    with: {
        "example:component/calculate@0.1.0": generate,
    },
});

use example::component::calculate::add;

fn main() {
    let a = 1;
    let b = 2;
    println!("{} + {} = {}", a, b, add(a, b));
}
