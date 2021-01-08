import { run as runSltr, seq, par, types, builtin } from "@fal-works/s-l-t-r";

import { DistConfig } from "../../common";

import tsc = require("../../use/typescript/tsc");
import format = require("../../use/format");

/** Config fields required by `command()`. */
export interface NodeModuleConfig extends DistConfig, tsc.TscConfig {
  typesDir?: string;
  format?: boolean;
}

const { cleandir } = builtin;

/**
 * Returns `Command` that does everything for building a Node.js module.
 * See README for required library dependencies.
 */
export const command = (config: NodeModuleConfig): types.Command => {
  const { distDir } = config;
  const typesDir = config.typesDir || distDir;

  const cleanAll = typesDir
    ? par(cleandir(distDir), cleandir(typesDir)).collapse().rename("clean")
    : cleandir(distDir);

  const runTsc = tsc.command(config);

  const all: types.Command[] = [cleanAll, runTsc];

  if (config.format !== false) {
    if (typesDir === distDir) {
      const formatAll = format.command(`${distDir}/**/*.{js,d.ts}`);
      all.push(formatAll);
    } else {
      const formatLib = format.command(`${distDir}/**/*.js`);
      const formatTypes = format.command(`${typesDir}/**/*.d.ts`);
      const formatAll = par(formatLib, formatTypes)
        .rename("format js & d.ts")
        .collapse();
      all.push(formatAll);
    }
  }

  return seq(...all).hide();
};

/**
 * Calls `command()` and then runs the command immediately.
 * See README for required library dependencies.
 */
export const run = (config: NodeModuleConfig): ReturnType<typeof runSltr> =>
  runSltr(command(config));
