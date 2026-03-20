wit_bindgen::generate!({
    world: "app",
    path: "wit",
    generate_all,
});

use example::koyomi::convert::{WarekiDate, WesternDate};

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 3 {
        print_usage();
        std::process::exit(1);
    }

    match args[1].as_str() {
        "-s" => convert_to_wareki(&args[2]),
        "-w" => convert_to_western(&args[2]),
        _ => {
            print_usage();
            std::process::exit(1);
        }
    }
}

fn print_usage() {
    eprintln!("Usage:");
    eprintln!("  koyomi-example -s 2019-05-01");
    eprintln!("  koyomi-example -w 令和1年5月1日");
}

fn convert_to_wareki(input: &str) {
    let parts: Vec<&str> = input.split('-').collect();
    if parts.len() != 3 {
        eprintln!("Error: invalid date format, expected YYYY-MM-DD");
        std::process::exit(1);
    }

    let year: u16 = parts[0].parse().unwrap_or_else(|_| {
        eprintln!("Error: invalid year");
        std::process::exit(1);
    });
    let month: u8 = parts[1].parse().unwrap_or_else(|_| {
        eprintln!("Error: invalid month");
        std::process::exit(1);
    });
    let day: u8 = parts[2].parse().unwrap_or_else(|_| {
        eprintln!("Error: invalid day");
        std::process::exit(1);
    });

    let date = WesternDate::new(year, month, day);
    match date.to_wareki() {
        Ok(wareki) => println!("{}", wareki.to_string()),
        Err(e) => {
            eprintln!("Error: {e}");
            std::process::exit(1);
        }
    }
}

fn convert_to_western(input: &str) {
    let (era, year, month, day) = parse_wareki(input).unwrap_or_else(|| {
        eprintln!("Error: invalid wareki format, expected e.g. 令和1年5月1日");
        std::process::exit(1);
    });

    let date = WarekiDate::new(&era, year, month, day);
    match date.to_western() {
        Ok(western) => println!("{}", western.to_string()),
        Err(e) => {
            eprintln!("Error: {e}");
            std::process::exit(1);
        }
    }
}

fn parse_wareki(input: &str) -> Option<(String, u16, u8, u8)> {
    let eras = ["令和", "平成", "昭和", "大正", "明治"];

    let (era, rest) = eras
        .iter()
        .find_map(|e| input.strip_prefix(e).map(|rest| (e.to_string(), rest)))?;

    let (year_str, rest) = rest.split_once('年')?;
    let year: u16 = if year_str == "元" {
        1
    } else {
        year_str.parse().ok()?
    };

    let (month_str, rest) = rest.split_once('月')?;
    let month: u8 = month_str.parse().ok()?;

    let day_str = rest.strip_suffix('日')?;
    let day: u8 = day_str.parse().ok()?;

    Some((era, year, month, day))
}
