use wasmcloud_component::http;

struct Component;

impl http::Server for Component {
    fn handle(
        request: http::IncomingRequest,
    ) -> http::Result<http::Response<impl http::OutgoingBody>> {
        let (parts, _body) = request.into_parts();
        let query = parts
            .uri
            .query()
            .map(ToString::to_string)
            .unwrap_or_default();

        let name = match query.split("=").collect::<Vec<&str>>()[..] {
            ["name", name] => name,
            _ => "World",
        };

        Ok(http::Response::new(format!("Hello, {}!\n", name)))
    }
}

http::export!(Component);
