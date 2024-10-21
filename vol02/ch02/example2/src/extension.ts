import * as vscode from "vscode";
import { Memory, WasmContext } from "@vscode/wasm-component-model";
import { example } from "./example";

// 拡張機能のメイン処理
function myExtension() {
  vscode.window.showInformationMessage("Hello World!");
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "example" is now active!');

  // Wasmファイルの読み込み
  const bits = await vscode.workspace.fs.readFile(vscode.Uri.parse(
    `${context.extensionUri}/target/wasm32-unknown-unknown/release/example.wasm`,
  ));

  // Wasmインスタンスの生成
  const wasmContext: WasmContext.Default = new WasmContext.Default();
  const instance = await WebAssembly.instantiate(
    await WebAssembly.compile(bits),
    example._.imports.create({
      vscode: {
        showInformationMessage: vscode.window.showInformationMessage,
      },
    }, wasmContext),
  );
  wasmContext.initialize(new Memory.Default(instance.exports));

  // コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand("example.helloWorld", myExtension),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "example.wasm",
      example._.exports.bind(
        instance.exports as example._.Exports,
        wasmContext,
      ).run,
    ),
  );
}

export function deactivate() {}
