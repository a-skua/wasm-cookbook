import * as vscode from "vscode";

// 拡張機能のメイン処理
function myExtension() {
  vscode.window.showInformationMessage("Hello World!");
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "example" is now active!');

  // コマンドの登録
  context.subscriptions.push(
    vscode.commands.registerCommand("example.helloWorld", myExtension),
  );
}

export function deactivate() {}
