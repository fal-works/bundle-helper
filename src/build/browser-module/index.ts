import { seq, par, types, builtin } from "@fal-works/s-l-t-r";

import { getDistFilePath, BrowserDistType } from "../../distribution";

import * as ts from "../../use/typescript";
import * as rollup from "../../use/rollup";
import { format } from "../../use/format";
import * as terser from "../../use/terser";

/** Config fields required by `command()`. */
export interface Config extends ts.TscConfig, rollup.RollupConfig {
  typesDir?: string;
}

const formatLibCommand = (config: Config) => (
  distType: BrowserDistType
): types.Command => {
  const path = getDistFilePath(config, distType);
  return format(path);
};

const { cleandir } = builtin;

/**
 * Returns `Command` that does everything for building a module for browsers.
 * Needs following libraries to be installed:
 * - typescript
 * - rollup
 * - prettier
 * - terser
 * - @fal-works/mere-file-transformer
 * - replacestream
 */
export const command = (config: Config): types.Command => {
  const { typesDir, tsOutDir, distDir } = config;

  const cleanBeforeTsc = typesDir
    ? par(cleandir(tsOutDir), cleandir(typesDir))
    : cleandir(tsOutDir);
  const tsc = ts.command(config);
  const transpile = seq(cleanBeforeTsc, tsc);

  const bundle = rollup.commandFromConfig(config);
  const formatLib = formatLibCommand(config);
  const bundleAndFormat = (distType: BrowserDistType) =>
    seq(bundle(distType), formatLib(distType));

  const minify = terser.commandFromConfig(config);

  const lib = seq(
    cleandir(distDir),
    par(
      seq(bundleAndFormat(BrowserDistType.Iife), minify(BrowserDistType.Iife)),
      bundleAndFormat(BrowserDistType.Esm)
    )
  );

  const libAndTypes = typesDir ? par(lib, format(typesDir)) : lib;

  return seq(transpile, libAndTypes);
};
