use proxy_wasm::{
  hostcalls,
  traits::{Context, HttpContext, RootContext},
  types::{Action, MetricType, Status},
};

use serde::Deserialize;

#[derive(Debug, Default, Clone)]
pub struct AuthFilter {
  filter_config: Option<FilterConfig>,
  metrics: Option<Metrics>,
}

#[derive(Debug, Clone)]
struct Metrics {
  request_id: u32,
  success_id: u32,
  failed_id: u32,
}

impl AuthFilter {
  fn dispatch_introspection(&self, token: &str) -> Result<u32, Status> {
    if let Some(conf) = &self.filter_config {
      let body = format!("token={}", token);
      let body_len = body.len().to_string();

      hostcalls::dispatch_http_call(
        &conf.introspection_upstream,
        vec![
          (":method", "POST"),
          (":path", &conf.introspection_path),
          (":authority", &conf.introspection_host),
          ("content-type", "application/x-www-form-urlencoded"),
          ("content-length", &body_len),
        ],
        Some(body.as_bytes()),
        vec![],
        std::time::Duration::from_secs(5),
      )
    } else {
      Err(Status::InternalFailure)
    }
  }
}

#[derive(Debug, Deserialize)]
struct Response {
  active: bool,
}

impl Context for AuthFilter {
  fn on_http_call_response(&mut self, _: u32, _: usize, body_size: usize, _: usize) {
    let is_active = self
      .get_http_call_response_body(0, body_size)
      .and_then(|body| serde_json::from_slice::<Response>(&body).ok())
      .map(|resp| resp.active)
      .unwrap_or(false);

    if is_active {
      self.resume_http_request();
    } else {
      self.send_http_response(401, vec![], Some(b"Unauthorized"));
    }
  }
}

#[derive(Debug, Deserialize, Clone)]
struct FilterConfig {
  introspection_upstream: String,
  introspection_host: String,
  introspection_path: String,
}

impl RootContext for AuthFilter {
  fn on_vm_start(&mut self, _: usize) -> bool {
    let metrics = [
      "auth_filter.request_count",
      "auth_filter.success_count",
      "auth_filter.failed_count",
    ];
    match metrics.map(|m| hostcalls::define_metric(MetricType::Counter, m)) {
      [Ok(request_id), Ok(success_id), Ok(failed_id)] => {
        self.metrics = Some(Metrics {
          request_id,
          success_id,
          failed_id,
        });
      }
      _ => return false,
    }
    true
  }

  fn on_configure(&mut self, _: usize) -> bool {
    if let Some(config_bytes) = self.get_plugin_configuration()
      && let Ok(config) = serde_json::from_slice::<FilterConfig>(&config_bytes)
    {
      self.filter_config = Some(config);
      true
    } else {
      false
    }
  }

  fn get_type(&self) -> Option<proxy_wasm::types::ContextType> {
    Some(proxy_wasm::types::ContextType::HttpContext)
  }

  fn create_http_context(&self, _context_id: u32) -> Option<Box<dyn HttpContext>> {
    Some(Box::new(self.clone()))
  }
}

impl HttpContext for AuthFilter {
  fn on_http_request_headers(&mut self, _: usize, _: bool) -> Action {
    if let Some(m) = self.metrics.as_ref() {
      let _ = hostcalls::increment_metric(m.request_id, 1);
    }

    if let Some(auth_header) = self.get_http_request_header("Authorization")
      && auth_header.starts_with("Bearer")
    {
      let token = auth_header.trim_start_matches("Bearer").trim().to_string();

      match self.dispatch_introspection(&token) {
        Ok(_) => return Action::Pause,
        Err(_) => {
          self.send_http_response(503, vec![], Some(b"Service Unavailable"));
          return Action::Pause;
        }
      }
    } else {
      self.send_http_response(401, vec![], Some(b"Unauthorized"));
      return Action::Pause;
    }
  }

  fn on_http_response_headers(&mut self, _: usize, _: bool) -> Action {
    if let Some(m) = self.metrics.as_ref() {
      if let Some(status) = self.get_http_response_header(":status")
        && status.starts_with('2')
      {
        let _ = hostcalls::increment_metric(m.success_id, 1);
      } else {
        let _ = hostcalls::increment_metric(m.failed_id, 1);
      }
    }
    Action::Continue
  }
}

proxy_wasm::main! {{
  proxy_wasm::set_log_level(proxy_wasm::types::LogLevel::Info);
  proxy_wasm::set_root_context(|_| Box::new(AuthFilter::default()));
}}
