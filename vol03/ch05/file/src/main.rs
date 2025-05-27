use std::fs;

fn main() {
    let paths = fs::read_dir(".").unwrap();
    for path in paths {
        let path = path.unwrap().path();
        if path.file_name().unwrap() == "Cargo.toml" {
            let content = fs::read_to_string(&path).unwrap();
            println!("{}", content);
            return;
        }
    }

    println!("Cargo.toml not found in the current directory.");
}
