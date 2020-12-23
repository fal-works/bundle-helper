import { run as runSltr, seq, par, types, builtin } from "@fal-works/s-l-t-r";

import { getDistFilePath, BrowserDistType } from "../../common";

import tsc = require("../../use/typescript/tsc");
import rollup = require("../../use/rollup");
import format = require("../../use/format");
import terser = require("../../use/terser");

/** Config fields required by `command()`. */
export interface Config
  extends tsc.TscConfig,
    rollup.RollupConfig,
    terser.TerserConfig {
  typesDir?: string;
}

const formatLibCommand = (config: Config) => (
  distType: BrowserDistType
): types.Command => {
  const path = getDistFilePath(config, distType);
  return format.command(path);
};

const { cleandir } = builtin;

/**
 * Returns `Command` that does everything for building a module for browsers.
 * See README for required library dependencies.
 */
export const command = (config: Config): types.Command => {
  const { Iife, Esm } = BrowserDistType;
  const { typesDir, tsOutDir, distDir } = config;

  const cleanBeforeTsc = typesDir
    ? par(cleandir(tsOutDir), cleandir(typesDir)).collapse()
    : cleandir(tsOutDir);
  const runTsc = tsc.command(config);
  const transpile = seq(cleanBeforeTsc, runTsc).rename("tsc").collapse();

  const bundle = rollup.commandFromConfig(config);
  const formatLib = formatLibCommand(config);
  const minify = terser.commandFromConfig(config);

  const createLib = par(
    seq(bundle(Iife), formatLib(Iife), minify(Iife)).rename("iife"),
    seq(bundle(Esm), formatLib(Esm)).rename("esm")
  );
  const lib = seq(cleandir(distDir), createLib).rename("lib").collapse();

  const libAndTypes = typesDir
    ? par(format.command(`${typesDir}/**/*.d.ts`), lib)
    : lib;

  return seq(transpile, libAndTypes).hide();
};

/**
 * Calls `command()` and then runs the command immediately.
 * See README for required library dependencies.
 */
export const run = (config: Config): ReturnType<typeof runSltr> =>
  runSltr(command(config));
