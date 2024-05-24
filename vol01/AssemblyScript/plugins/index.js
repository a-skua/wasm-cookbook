import asc from "assemblyscript/asc";

const asconfigJSON = {
  targets: {},
  options: { bindings: "esm" },
};

const indexTS = `
@external("__app", "output")
declare function output(msg: string): void;

export function main(): void {
  output('Hello, World!');
}
`;

const results = [];
await asc.main(["assembly/index.ts", "-o", "build/index.wasm"], {
  readFile: (filename) => {
    switch (filename) {
      case "asconfig.json": {
        return Promise.resolve(JSON.stringify(asconfigJSON));
      }
      case "assembly/index.ts": {
        return Promise.resolve(indexTS);
      }
    }
    throw new Error(`Not Found ${filename}`);
  },
  writeFile: (filename, contents) => results.push({ filename, contents }),
  listFiles: () => {
    throw new Error("Not Implemented");
  },
});

function __liftString(pointer) {
  if (!pointer) return null;
  const end = pointer +
      new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>>
    1;
  const memoryU16 = new Uint16Array(memory.buffer);
  let start = pointer >>> 1,
    string = "";
  while (end - start > 1024) {
    string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
  }
  return string + String.fromCharCode(...memoryU16.subarray(start, end));
}

const env = {
  abort(message, fileName, lineNumber, columnNumber) {
    message = __liftString(message >>> 0);
    fileName = __liftString(fileName >>> 0);
    lineNumber = lineNumber >>> 0;
    columnNumber = columnNumber >>> 0;
    (() => {
      // @external.js
      throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
    })();
  },
};

const indexWasm = results.find(({ filename }) =>
  filename === "build/index.wasm"
);

const { instance } = await WebAssembly.instantiate(indexWasm.contents, {
  __app: {
    random: () => Math.floor(Math.random() * 1024),
    output: (msg) => console.log(__liftString(msg)),
  },
  env,
});

const memory = instance.exports.memory;
const main = instance.exports.main;

main();
