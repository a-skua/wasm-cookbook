mod bindings {
    wit_bindgen::generate!({
        path: "wit",
        generate_all,
    });
}

use bindings::gcloud::storage::objects;
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "gsutil")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Copy files between local filesystem and Google Cloud Storage
    Cp {
        /// Source path (local file or gs://bucket/object)
        src: String,
        /// Destination path (local file or gs://bucket/object)
        dst: String,
    },
}

struct GsUrl {
    bucket: String,
    object: String,
}

fn parse_gs_url(url: &str) -> Option<GsUrl> {
    let path = url.strip_prefix("gs://")?;
    let (bucket, object) = path.split_once('/')?;
    if bucket.is_empty() || object.is_empty() {
        return None;
    }
    Some(GsUrl {
        bucket: bucket.to_string(),
        object: object.to_string(),
    })
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Cp { src, dst } => cp(&src, &dst),
    }
}

fn cp(src: &str, dst: &str) {
    match (parse_gs_url(src), parse_gs_url(dst)) {
        // download: gs://bucket/object → local file
        (Some(gs), None) => download(&gs, dst),
        // upload: local file → gs://bucket/object
        (None, Some(gs)) => upload(src, &gs),
        (Some(_), Some(_)) => {
            eprintln!("Error: gs:// to gs:// copy is not supported");
            std::process::exit(1);
        }
        (None, None) => {
            eprintln!("Error: at least one of src or dst must be a gs:// URL");
            std::process::exit(1);
        }
    }
}

fn download(gs: &GsUrl, local_path: &str) {
    let data = match objects::get_object(&gs.bucket, &gs.object) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("Error: failed to download gs://{}/{}: {e:?}", gs.bucket, gs.object);
            std::process::exit(1);
        }
    };

    if let Err(e) = std::fs::write(local_path, &data) {
        eprintln!("Error: failed to write {local_path}: {e}");
        std::process::exit(1);
    }

    println!(
        "Copying gs://{}/{} to {}...",
        gs.bucket, gs.object, local_path,
    );
}

fn upload(local_path: &str, gs: &GsUrl) {
    let data = match std::fs::read(local_path) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("Error: failed to read {local_path}: {e}");
            std::process::exit(1);
        }
    };

    let content_type = guess_content_type(&gs.object);

    match objects::upload_object(&gs.bucket, &gs.object, &data, &content_type) {
        Ok(_) => {}
        Err(e) => {
            eprintln!(
                "Error: failed to upload to gs://{}/{}: {e:?}",
                gs.bucket, gs.object,
            );
            std::process::exit(1);
        }
    }

    println!(
        "Copying {} to gs://{}/{}...",
        local_path, gs.bucket, gs.object,
    );
}

fn guess_content_type(object_name: &str) -> String {
    match object_name.rsplit_once('.') {
        Some((_, ext)) => match ext {
            "html" => "text/html",
            "css" => "text/css",
            "js" => "application/javascript",
            "json" => "application/json",
            "png" => "image/png",
            "jpg" | "jpeg" => "image/jpeg",
            "gif" => "image/gif",
            "svg" => "image/svg+xml",
            "pdf" => "application/pdf",
            "txt" => "text/plain",
            "xml" => "application/xml",
            "wasm" => "application/wasm",
            _ => "application/octet-stream",
        },
        None => "application/octet-stream",
    }
    .to_string()
}
