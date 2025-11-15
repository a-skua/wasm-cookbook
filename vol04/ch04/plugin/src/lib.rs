use extism_pdk::*;
use serde::{Deserialize, Serialize};

#[derive(FromBytes, Deserialize, PartialEq, Debug)]
#[encoding(Json)]
#[serde(rename_all = "snake_case")]
enum PriceType {
    TaxIncluded, // 税 込
    TaxExcluded, // 税 抜
}

#[derive(FromBytes, Deserialize, PartialEq, Debug)]
#[encoding(Json)]
struct Input {
    price: i32,    // 入 力 金 額 （price_type に 応 じ て 税 込 ま た は 税 抜 ）
    tax_rate: i32, // 税 率
    price_type: PriceType,
}

#[derive(ToBytes, Serialize, PartialEq, Debug)]
#[encoding(Json)]
struct Output {
    pre_tax_price: i32, // 税 抜 き 金 額
    tax_amount: i32,    // 消 費 税 額
    total_price: i32,   // 税 込 み 金 額
}

#[plugin_fn]
pub fn calc_tax(input: Input) -> FnResult<Output> {
    let tax_rate = input.tax_rate as f64 / 100.0;
    let price = input.price as f64;
    let (pre_tax_price, tax_amount, total_price) = match input.price_type {
        // 税 込 -> 税 抜
        PriceType::TaxIncluded => {
            let pre_tax_price = (price / (1.0 + tax_rate)).round() as i32;
            let tax_amount = input.price - pre_tax_price;
            (pre_tax_price, tax_amount, input.price)
        }
        // 税 抜 -> 税 込
        PriceType::TaxExcluded => {
            let tax_amount = (price * tax_rate).round() as i32;
            let total_price = input.price + tax_amount;
            (input.price, tax_amount, total_price)
        }
    };
    Ok(Output {
        pre_tax_price,
        tax_amount,
        total_price,
    })
}
