import fs = require("fs");
import sltr = require("@fal-works/s-l-t-r");

import common = require("../../common");
import transpile = require("../../use/typescript/transpile-only-all");
import rollup = require("../../use/rollup");
import format = require("../../use/format");
import terser = require("../../use/terser");

import type { TsConfig } from "../../use/typescript/options";
import type { types } from "@fal-works/s-l-t-r";

const { seq, par, cmdEx } = sltr;
const { cleandir } = sltr.builtin;

/** Config fields required by `command()`. */
export interface BrowserAppConfig
  extends TsConfig,
    rollup.RollupConfig,
    terser.TerserConfig {
  srcDir: string;
  format?: boolean;
  minify?: boolean;
  minifiedBannerContent?: string;
}

const { Iife } = common.BrowserDistType;

/** Creates `Command` that formats dist files. */
const formatDistCommand = (config: BrowserAppConfig) => (
  distType: common.BrowserDistType
): types.Command => {
  const path = common.getDistFilePath(config, distType);
  return format.command(path);
};

/** Creates `Command` that adds banner to the min file. */
const createAddMinBanner = (config: BrowserAppConfig, content: string) => {
  const banner = common.createBanner(content);
  const { minFilePath } = common.getDistFilePaths(config, Iife);
  const execAddMinBanner = async () => {
    const code = await fs.promises.readFile(minFilePath);
    await fs.promises.writeFile(minFilePath, banner + code);
  };
  const addMinBanner = cmdEx(execAddMinBanner, "add .min banner");
  return addMinBanner;
};

/**
 * Returns `Command` that does everything for building a module for browsers.
 * See README for required library dependencies.
 */
export const command = (config: BrowserAppConfig): sltr.types.Command => {
  const { tsOutDir, distDir } = config;

  // prepare bundle --------------------------------
  const cleanTsOut = cleandir(tsOutDir);
  const { srcDir } = config;
  const emitTsOut = transpile.commandFromConfig(config)(Iife)(srcDir, tsOutDir);
  const transpileDist = seq(cleanTsOut, emitTsOut)
    .rename("transpile")
    .collapse();
  const prepareBundle = par(transpileDist, cleandir(distDir).hide())
    .rename("transpile etc")
    .collapse();

  // bundle etc. -----------------------------------
  const bundleCommands: types.Command[] = [];
  bundleCommands.push(rollup.commandFromConfig(config)(Iife));
  if (config.format !== false)
    bundleCommands.push(formatDistCommand(config)(Iife));
  if (config.minify !== false) {
    bundleCommands.push(terser.commandFromConfig(config)(Iife));

    if (config.minifiedBannerContent) {
      const addMinBanner = createAddMinBanner(
        config,
        config.minifiedBannerContent
      );
      bundleCommands.push(addMinBanner);
    }
  }
  const bundleEtc = seq(...bundleCommands);

  return seq(prepareBundle, bundleEtc).hide();
};

/**
 * Calls `command()` and then runs the command immediately.
 * See README for required library dependencies.
 */
export const run = (config: BrowserAppConfig): ReturnType<typeof sltr.run> =>
  sltr.run(command(config));
