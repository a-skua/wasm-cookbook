@pragma('wasm:import', '__dart.calculate')
external double calculate();

void main(List<String> arguments) {
  print('Hello world: ${calculate()}!');
}
