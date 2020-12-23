import { seq, par, types, builtin } from "@fal-works/s-l-t-r";

import { getDistFilePath, DistConfig, DistType } from "../../distribution";

import * as ts from "../../use/typescript";
import * as format from "../../use/format";

/** Config fields required by `command()`. */
export interface Config extends DistConfig, ts.TscConfig {
  typesDir?: string;
}

const { cleandir } = builtin;

/**
 * Returns `Command` that does everything for building a Node.js module.
 * See README for required library dependencies.
 */
export const command = (config: Config): types.Command => {
  const { typesDir, distDir } = config;

  const cleanAll = typesDir
    ? par(cleandir(distDir), cleandir(typesDir)).collapse()
    : cleandir(distDir);

  const tsc = ts.command(config);

  const formatLib = format.command(getDistFilePath(config, DistType.Cjs));

  const formatAll = typesDir
    ? par(formatLib, format.command(`${typesDir}/**/*.d.ts`))
        .rename("format js & d.ts")
        .collapse()
    : formatLib;

  return seq(cleanAll, tsc, formatAll).hide();
};
