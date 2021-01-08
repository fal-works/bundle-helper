import sltr = require("@fal-works/s-l-t-r");

import common = require("../../common");
import tsc = require("../../use/typescript/tsc");
import rollup = require("../../use/rollup");
import format = require("../../use/format");
import terser = require("../../use/terser");

import type { types } from "@fal-works/s-l-t-r";

const { seq, par } = sltr;
const { cleandir } = sltr.builtin;

/** Config fields required by `command()`. */
export interface BrowserModuleConfig
  extends tsc.TscConfig,
    rollup.RollupConfig,
    terser.TerserConfig {
  typesDir?: string;
  format?: boolean;
  minify?: boolean;
}

/** Creates `Command` that formats lib files. */
const formatLibCommand = (config: BrowserModuleConfig) => (
  distType: common.BrowserDistType
): types.Command => {
  const path = common.getDistFilePath(config, distType);
  return format.command(path);
};

/**
 * Returns `Command` that does everything for building a module for browsers.
 * See README for required library dependencies.
 */
export const command = (config: BrowserModuleConfig): types.Command => {
  const { Iife, Esm } = common.BrowserDistType;
  const { tsOutDir, distDir } = config;
  const typesDir = config.typesDir || distDir;

  const cleanBeforeTsc =
    typesDir !== distDir
      ? par(cleandir(tsOutDir), cleandir(typesDir)).collapse()
      : cleandir(tsOutDir);
  const runTsc = tsc.command(config);
  const transpile = seq(cleanBeforeTsc, runTsc).rename("tsc").collapse();

  const bundle = rollup.commandFromConfig(config);
  const formatLib = formatLibCommand(config);
  const minify = terser.commandFromConfig(config);

  const createIife: types.Command[] = [bundle(Iife)];
  const createEsm: types.Command[] = [bundle(Esm)];
  if (config.format !== false) {
    createIife.push(formatLib(Iife));
    createEsm.push(formatLib(Esm));
  }
  if (config.minify !== false) {
    createIife.push(minify(Iife));
  }

  const createLib = par(
    seq(...createIife).rename("iife"),
    seq(...createEsm).rename("esm")
  );
  const lib = seq(cleandir(distDir), createLib).rename("lib").collapse();

  const libAndTypes =
    config.format !== false
      ? par(format.command(`${typesDir}/**/*.d.ts`), lib)
      : lib;

  return seq(transpile, libAndTypes).hide();
};

/**
 * Calls `command()` and then runs the command immediately.
 * See README for required library dependencies.
 */
export const run = (config: BrowserModuleConfig): ReturnType<typeof sltr.run> =>
  sltr.run(command(config));
