import 'dart:js_interop';

@JS('__dart.responseBody')
external void responseBody(JSString body);

void main(List<String> arguments) {
  responseBody('Hello, World!'.toJS);
}
