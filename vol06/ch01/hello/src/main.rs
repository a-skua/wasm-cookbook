use std::env;
use std::process;

fn main() {
    let mut args = env::args();
    let cmd = args.next().unwrap();

    let (Some(name), None) = (args.next(), args.next()) else {
        eprintln!("usage: {cmd} <name>");
        process::exit(1);
    };

    println!("Hello, {name}!");
}
