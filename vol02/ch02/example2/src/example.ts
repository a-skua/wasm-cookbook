/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/ban-types */
import * as $wcm from '@vscode/wasm-component-model';
import type { i32 } from '@vscode/wasm-component-model';

export namespace Vscode {
	export type showInformationMessage = (message: string) => void;
}
export type Vscode = {
	showInformationMessage: Vscode.showInformationMessage;
};
export namespace example {
	export type Imports = {
		vscode: Vscode;
	};
	export namespace Imports {
		export type Promisified = $wcm.$imports.Promisify<Imports>;
	}
	export namespace imports {
		export type Promisify<T> = $wcm.$imports.Promisify<T>;
	}
	export type Exports = {
		run: () => void;
	};
	export namespace Exports {
		export type Promisified = $wcm.$exports.Promisify<Exports>;
	}
	export namespace exports {
		export type Promisify<T> = $wcm.$exports.Promisify<T>;
	}
}

export namespace Vscode.$ {
	export const showInformationMessage = new $wcm.FunctionType<Vscode.showInformationMessage>('show-information-message',[
		['message', $wcm.wstring],
	], undefined);
}
export namespace Vscode._ {
	export const id = 'vscode:example/vscode' as const;
	export const witName = 'vscode' as const;
	export const functions: Map<string, $wcm.FunctionType> = new Map([
		['showInformationMessage', $.showInformationMessage]
	]);
	export type WasmInterface = {
		'show-information-message': (message_ptr: i32, message_len: i32) => void;
	};
	export namespace imports {
		export type WasmInterface = _.WasmInterface;
	}
	export namespace exports {
		export type WasmInterface = _.WasmInterface;
	}
}
export namespace example.$ {
	export namespace exports {
		export const run = new $wcm.FunctionType<example.Exports['run']>('run', [], undefined);
	}
}
export namespace example._ {
	export const id = 'vscode:example/example' as const;
	export const witName = 'example' as const;
	export namespace imports {
		export const interfaces: Map<string, $wcm.InterfaceType> = new Map<string, $wcm.InterfaceType>([
			['Vscode', Vscode._]
		]);
		export function create(service: example.Imports, context: $wcm.WasmContext): Imports {
			return $wcm.$imports.create<Imports>(_, service, context);
		}
		export function loop(service: example.Imports, context: $wcm.WasmContext): example.Imports {
			return $wcm.$imports.loop<example.Imports>(_, service, context);
		}
	}
	export type Imports = {
		'vscode:example/vscode': Vscode._.imports.WasmInterface;
	};
	export namespace exports {
		export const functions: Map<string, $wcm.FunctionType> = new Map([
			['run', $.exports.run]
		]);
		export function bind(exports: Exports, context: $wcm.WasmContext): example.Exports {
			return $wcm.$exports.bind<example.Exports>(_, exports, context);
		}
	}
	export type Exports = {
		'run': () => void;
	};
	export function bind(service: example.Imports, code: $wcm.Code, context?: $wcm.ComponentModelContext): Promise<example.Exports>;
	export function bind(service: example.Imports.Promisified, code: $wcm.Code, port: $wcm.RAL.ConnectionPort, context?: $wcm.ComponentModelContext): Promise<example.Exports.Promisified>;
	export function bind(service: example.Imports | example.Imports.Promisified, code: $wcm.Code, portOrContext?: $wcm.RAL.ConnectionPort | $wcm.ComponentModelContext, context?: $wcm.ComponentModelContext | undefined): Promise<example.Exports> | Promise<example.Exports.Promisified> {
		return $wcm.$main.bind(_, service, code, portOrContext, context);
	}
}