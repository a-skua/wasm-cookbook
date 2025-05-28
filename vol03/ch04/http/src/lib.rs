wit_bindgen::generate!({
    world: "edge",
    generate_all,
});

use exports::wasi::http::incoming_handler::Guest;
use wasi::http::types::{
    Headers, IncomingRequest, OutgoingBody, OutgoingResponse, ResponseOutparam,
};

struct Handler;

impl Guest for Handler {
    fn handle(request: IncomingRequest, outparam: ResponseOutparam) {
        let query = request.path_with_query().unwrap_or_default();
        let query = query.split('?').nth(1).unwrap_or_default();

        let name = match query.split('&').find(|&s| s.starts_with("name=")) {
            Some(s) => s.trim_start_matches("name=").to_string(),
            None => "World".to_string(),
        };

        let resp = OutgoingResponse::new(Headers::new());
        let body = resp.body().unwrap();
        let output = body.write().unwrap();
        output
            .write(format!("Hello, {name}!\n").as_bytes())
            .unwrap();
        drop(output);
        OutgoingBody::finish(body, None).unwrap();
        ResponseOutparam::set(outparam, Ok(resp));
    }
}

export!(Handler);
