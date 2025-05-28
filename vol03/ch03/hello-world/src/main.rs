#[cfg(not(all(target_os = "wasi", target_env = "p2")))]
fn name() -> &'static str {
    "World"
}

#[cfg(all(target_os = "wasi", target_env = "p2"))]
fn name() -> &'static str {
    "WASI 0.2"
}

fn main() {
    println!("Hello, {}!", name());
}
