import * as esbuildApi from "esbuild";
import { cmdEx, types } from "@fal-works/s-l-t-r";

const returnVoid = () => {};

/** @returns `Command` that runs esbuild. */
export const command = (options: esbuildApi.BuildOptions): types.Command =>
  cmdEx(() => esbuildApi.build(options).then(returnVoid), `esbuild`);
