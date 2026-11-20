mod bindings {
    wit_bindgen::generate!({
        path: "wit",
        generate_all,
    });
}

use std::cell::RefCell;

use bindings::exports::wasi::cli::{stderr, stdin, stdout};
use bindings::exports::wasi::io::{error, poll, streams};
use bindings::wasi::cli as host_cli;
use bindings::wasi::io as host_io;

// stdoutの内容をフィルタリングする処理
// `Hello, name!`のような出力が来るので，`Hello, ***!`に書き換えて出力する
// (この時，*の数はnameの文字数と同じにする)
//
// `wasi:cli/stdout`の`get-stdout`は`wasi:io/streams`の`output-stream`を返すので，
// このコンポーネントは`wasi:io/{error,poll,streams}`を自前でexportし，
// ホスト側のリソースをラップして中継する．
// stdin/stderrも同じ`wasi:io/streams`の型を使うため，素通しでexportしている．

struct Filter;

/// 1行分の出力をフィルタリングする
///
/// `Hello, <name>!` に一致する行は `<name>` を同じ文字数の `*` に置き換える．
/// それ以外の行(UTF-8として不正な行も含む)はそのまま返す．
fn filter_line(line: &[u8]) -> Vec<u8> {
    const PREFIX: &str = "Hello, ";
    const SUFFIX: &str = "!";

    let (body, newline): (&[u8], &[u8]) = match line.strip_suffix(b"\n") {
        Some(body) => match body.strip_suffix(b"\r") {
            Some(body) => (body, b"\r\n"),
            None => (body, b"\n"),
        },
        None => (line, b""),
    };

    let Ok(text) = std::str::from_utf8(body) else {
        return line.to_vec();
    };

    match text
        .strip_prefix(PREFIX)
        .and_then(|rest| rest.strip_suffix(SUFFIX))
    {
        Some(name) if !name.is_empty() => {
            let masked = "*".repeat(name.chars().count());
            let mut out = format!("{PREFIX}{masked}{SUFFIX}").into_bytes();
            out.extend_from_slice(newline);
            out
        }
        _ => line.to_vec(),
    }
}

thread_local! {
    /// stdoutに書き込まれた，まだ改行が来ていない部分
    ///
    /// ゲスト(例: Rustのstd)は書き込みのたびに`get-stdout`を呼ぶ可能性があるので，
    /// ストリーム単位ではなくグローバルに保持する．
    static STDOUT_BUFFER: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}

/// `blocking-write-and-flush`の1回あたりの上限
const MAX_CHUNK: usize = 4096;

fn write_all(
    stream: &host_io::streams::OutputStream,
    bytes: &[u8],
) -> Result<(), streams::StreamError> {
    for chunk in bytes.chunks(MAX_CHUNK) {
        stream
            .blocking_write_and_flush(chunk)
            .map_err(convert_error)?;
    }
    Ok(())
}

fn convert_error(e: host_io::streams::StreamError) -> streams::StreamError {
    match e {
        host_io::streams::StreamError::LastOperationFailed(e) => {
            streams::StreamError::LastOperationFailed(error::Error::new(Error(e)))
        }
        host_io::streams::StreamError::Closed => streams::StreamError::Closed,
    }
}

// ---------------------------------------------------------------------------
// wasi:io/error
// ---------------------------------------------------------------------------

struct Error(host_io::error::Error);

impl error::GuestError for Error {
    fn to_debug_string(&self) -> String {
        self.0.to_debug_string()
    }
}

impl error::Guest for Filter {
    type Error = Error;
}

// ---------------------------------------------------------------------------
// wasi:io/poll
// ---------------------------------------------------------------------------

struct Pollable(host_io::poll::Pollable);

impl poll::GuestPollable for Pollable {
    fn ready(&self) -> bool {
        self.0.ready()
    }

    fn block(&self) {
        self.0.block()
    }
}

impl poll::Guest for Filter {
    type Pollable = Pollable;

    fn poll(in_: Vec<poll::PollableBorrow<'_>>) -> Vec<u32> {
        let inner: Vec<&host_io::poll::Pollable> =
            in_.iter().map(|p| &p.get::<Pollable>().0).collect();
        host_io::poll::poll(&inner)
    }
}

fn wrap_pollable(p: host_io::poll::Pollable) -> poll::Pollable {
    poll::Pollable::new(Pollable(p))
}

// ---------------------------------------------------------------------------
// wasi:io/streams
// ---------------------------------------------------------------------------

struct InputStream(host_io::streams::InputStream);

impl streams::GuestInputStream for InputStream {
    fn read(&self, len: u64) -> Result<Vec<u8>, streams::StreamError> {
        self.0.read(len).map_err(convert_error)
    }

    fn blocking_read(&self, len: u64) -> Result<Vec<u8>, streams::StreamError> {
        self.0.blocking_read(len).map_err(convert_error)
    }

    fn skip(&self, len: u64) -> Result<u64, streams::StreamError> {
        self.0.skip(len).map_err(convert_error)
    }

    fn blocking_skip(&self, len: u64) -> Result<u64, streams::StreamError> {
        self.0.blocking_skip(len).map_err(convert_error)
    }

    fn subscribe(&self) -> poll::Pollable {
        wrap_pollable(self.0.subscribe())
    }
}

struct OutputStream {
    inner: host_io::streams::OutputStream,
    /// trueならstdoutとして行単位でフィルタリングする
    filtered: bool,
}

impl OutputStream {
    /// 書き込まれたバイト列を処理する
    ///
    /// フィルタ対象なら改行までバッファリングし，完成した行だけを書き換えて出力する．
    fn put(&self, contents: &[u8]) -> Result<(), streams::StreamError> {
        if !self.filtered {
            return write_all(&self.inner, contents);
        }

        let lines = STDOUT_BUFFER.with_borrow_mut(|buf| {
            buf.extend_from_slice(contents);
            match buf.iter().rposition(|&b| b == b'\n') {
                Some(pos) => buf.drain(..=pos).collect::<Vec<u8>>(),
                None => Vec::new(),
            }
        });

        let out: Vec<u8> = lines
            .split_inclusive(|&b| b == b'\n')
            .flat_map(filter_line)
            .collect();
        write_all(&self.inner, &out)
    }
}

impl Drop for OutputStream {
    /// ストリームが破棄される時に改行なしで残っている部分を出力する
    fn drop(&mut self) {
        if !self.filtered {
            return;
        }
        let rest = STDOUT_BUFFER.with_borrow_mut(std::mem::take);
        if !rest.is_empty() {
            let _ = write_all(&self.inner, &filter_line(&rest));
        }
    }
}

impl streams::GuestOutputStream for OutputStream {
    fn check_write(&self) -> Result<u64, streams::StreamError> {
        self.inner.check_write().map_err(convert_error)
    }

    fn write(&self, contents: Vec<u8>) -> Result<(), streams::StreamError> {
        if self.filtered {
            self.put(&contents)
        } else {
            self.inner.write(&contents).map_err(convert_error)
        }
    }

    fn blocking_write_and_flush(&self, contents: Vec<u8>) -> Result<(), streams::StreamError> {
        if self.filtered {
            self.put(&contents)
        } else {
            self.inner
                .blocking_write_and_flush(&contents)
                .map_err(convert_error)
        }
    }

    fn flush(&self) -> Result<(), streams::StreamError> {
        self.inner.flush().map_err(convert_error)
    }

    fn blocking_flush(&self) -> Result<(), streams::StreamError> {
        self.inner.blocking_flush().map_err(convert_error)
    }

    fn subscribe(&self) -> poll::Pollable {
        wrap_pollable(self.inner.subscribe())
    }

    fn write_zeroes(&self, len: u64) -> Result<(), streams::StreamError> {
        if self.filtered {
            self.put(&vec![0; len as usize])
        } else {
            self.inner.write_zeroes(len).map_err(convert_error)
        }
    }

    fn blocking_write_zeroes_and_flush(&self, len: u64) -> Result<(), streams::StreamError> {
        if self.filtered {
            self.put(&vec![0; len as usize])
        } else {
            self.inner
                .blocking_write_zeroes_and_flush(len)
                .map_err(convert_error)
        }
    }

    fn splice(
        &self,
        src: streams::InputStreamBorrow<'_>,
        len: u64,
    ) -> Result<u64, streams::StreamError> {
        let src = &src.get::<InputStream>().0;
        if self.filtered {
            let bytes = src.read(len).map_err(convert_error)?;
            self.put(&bytes)?;
            Ok(bytes.len() as u64)
        } else {
            self.inner.splice(src, len).map_err(convert_error)
        }
    }

    fn blocking_splice(
        &self,
        src: streams::InputStreamBorrow<'_>,
        len: u64,
    ) -> Result<u64, streams::StreamError> {
        let src = &src.get::<InputStream>().0;
        if self.filtered {
            let bytes = src.blocking_read(len).map_err(convert_error)?;
            self.put(&bytes)?;
            Ok(bytes.len() as u64)
        } else {
            self.inner.blocking_splice(src, len).map_err(convert_error)
        }
    }
}

impl streams::Guest for Filter {
    type InputStream = InputStream;
    type OutputStream = OutputStream;
}

// ---------------------------------------------------------------------------
// wasi:cli/{stdin,stdout,stderr}
// ---------------------------------------------------------------------------

impl stdin::Guest for Filter {
    fn get_stdin() -> streams::InputStream {
        streams::InputStream::new(InputStream(host_cli::stdin::get_stdin()))
    }
}

impl stdout::Guest for Filter {
    fn get_stdout() -> streams::OutputStream {
        streams::OutputStream::new(OutputStream {
            inner: host_cli::stdout::get_stdout(),
            filtered: true,
        })
    }
}

impl stderr::Guest for Filter {
    fn get_stderr() -> streams::OutputStream {
        streams::OutputStream::new(OutputStream {
            inner: host_cli::stderr::get_stderr(),
            filtered: false,
        })
    }
}

bindings::export!(Filter with_types_in bindings);

#[cfg(test)]
mod tests {
    use super::filter_line;

    #[test]
    fn masks_name() {
        assert_eq!(filter_line(b"Hello, world!\n"), b"Hello, *****!\n");
        assert_eq!(filter_line(b"Hello, a!"), b"Hello, *!");
    }

    #[test]
    fn counts_chars_not_bytes() {
        assert_eq!(filter_line("Hello, あすか!\n".as_bytes()), b"Hello, ***!\n");
    }

    #[test]
    fn passes_through_other_lines() {
        assert_eq!(filter_line(b"Goodbye, world!\n"), b"Goodbye, world!\n");
        assert_eq!(filter_line(b"Hello, !\n"), b"Hello, !\n");
        assert_eq!(filter_line(b"\xff\n"), b"\xff\n");
    }
}
