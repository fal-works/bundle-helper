if (!require("fs").existsSync("lib/index.js")) {
  console.error("[!] Library files not found. First build with npm scripts.");
  process.exit(1);
}

const builder = require("../lib/build/node-module");

builder.run({
  distDir: "lib",
});
