import esbuildApi = require("esbuild");
import sltr = require("@fal-works/s-l-t-r");

const returnVoid = () => {};

/** @returns `Command` that runs esbuild. */
export const command = (options: esbuildApi.BuildOptions): sltr.types.Command =>
  sltr.cmdEx(() => esbuildApi.build(options).then(returnVoid), `esbuild`);

export * as bundle from "./bundle";
export * as minify from "./minify";
