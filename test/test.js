if (!require("fs").existsSync("lib/index.js")) {
  console.error("[!] Library files not found. First build with npm scripts.");
  process.exit(1);
}

const ts = require("../lib/use/typescript/transpile-only-all");

ts.executeFromConfig({})("cjs")("src", "src2");
