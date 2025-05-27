use wstd::http::{Client, Result, request::Request};

#[wstd::main]
async fn main() -> Result<()> {
    let client = Client::new();

    // リクエスト作成
    let request = Request::get("https://example.com")
        .header("User-Agent", "wstd/1.0")
        .body(wstd::io::empty())
        .unwrap();

    // リクエスト送信
    let response = client.send(request).await?;

    // レスポンスボディ出力
    let mut body = response.into_body();
    wstd::io::copy(&mut body, wstd::io::stdout()).await?;
    Ok(())
}
