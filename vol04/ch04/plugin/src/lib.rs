use extism_pdk::*;
use serde::{Deserialize, Serialize};

#[derive(FromBytes, Deserialize, PartialEq, Debug)]
#[encoding(Json)]
#[serde(rename_all = "snake_case")]
enum PriceType {
    TaxIncluded, // 税込
    TaxExcluded, // 税抜
}

#[derive(FromBytes, Deserialize, PartialEq, Debug)]
#[encoding(Json)]
struct Input {
    price: i32,    // 入力金額（price_type に応じて税込または税抜）
    tax_rate: i32, // 税率
    price_type: PriceType,
}

#[derive(ToBytes, Serialize, PartialEq, Debug)]
#[encoding(Json)]
struct Output {
    pre_tax_price: i32, // 税抜き金額
    tax_amount: i32,    // 消費税額
    total_price: i32,   // 税込み金額
}

#[plugin_fn]
pub fn calc_tax(input: Input) -> FnResult<Output> {
    let tax_rate = input.tax_rate as f64 / 100.0;
    let price = input.price as f64;
    let (pre_tax_price, tax_amount, total_price) = match input.price_type {
        // 税込 -> 税抜
        PriceType::TaxIncluded => {
            let pre_tax_price = (price / (1.0 + tax_rate)).round() as i32;
            let tax_amount = input.price - pre_tax_price;
            (pre_tax_price, tax_amount, input.price)
        }
        // 税抜 -> 税込
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
