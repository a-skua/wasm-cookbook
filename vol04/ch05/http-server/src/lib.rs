use wstd::http::body::IncomingBody;
use wstd::http::server::{Finished, Responder};
use wstd::http::{IntoBody, Request, Response, StatusCode};

#[wstd::http_server]
async fn main(req: Request<IncomingBody>, res: Responder) -> Finished {
    match (req.method().as_str(), req.uri().path()) {
        ("GET", "/") => hello(req, res).await,
        _ => not_found(req, res).await,
    }
}

async fn hello(_: Request<IncomingBody>, res: Responder) -> Finished {
    let response = Response::new("Hello Wasm World!".into_body());

    res.respond(response).await
}

async fn not_found(_: Request<IncomingBody>, res: Responder) -> Finished {
    let response = Response::builder()
        .status(StatusCode::NOT_FOUND)
        .body("404 Not Found".into_body())
        .expect("Cannot fail to build response");
    res.respond(response).await
}
