import 'dart:js_interop';

@JS('__dart.calculate')
external JSNumber calculate();

@JS('console.log')
external void printJS(JSString message);

void main(List<String> arguments) {
  printJS('Hello world: ${calculate().toDartInt}!'.toJS);
}
