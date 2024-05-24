import 'package:http/http.dart';
import 'package:cf_workers/cf_workers.dart';

Future<void> main(List<String> arguments) {
  return Workers((request) async {
    return Response('Hello, World!', 200);
  }).serve();
}
