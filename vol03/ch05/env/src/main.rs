use std::env;

fn main() {
    let env_vars = env::vars();
    for (key, value) in env_vars {
        println!("{}={}", key, value);
    }
}
