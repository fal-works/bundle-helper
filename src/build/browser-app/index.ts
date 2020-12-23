import {
  run as runSltr,
  seq,
  par,
  types,
  builtin,
  cmdEx,
} from "@fal-works/s-l-t-r";
import fs = require("fs");

import {
  getDistFilePath,
  BrowserDistType,
  createBanner,
  getDistFilePaths,
} from "../../common";

import { TsConfig } from "../../use/typescript/options";
import transpile = require("../../use/typescript/transpile-only-all");
import rollup = require("../../use/rollup");
import format = require("../../use/format");
import terser = require("../../use/terser");

/** Config fields required by `command()`. */
export interface Config
  extends TsConfig,
    rollup.RollupConfig,
    terser.TerserConfig {
  srcDir: string;
  minify?: boolean;
  minifiedBannerContent?: string;
}

const { Iife } = BrowserDistType;

const formatDistCommand = (config: Config) => (
  distType: BrowserDistType
): types.Command => {
  const path = getDistFilePath(config, distType);
  return format.command(path);
};

const { cleandir } = builtin;

const createAddMinBanner = (config: Config, content: string) => {
  const banner = createBanner(content);
  const { minFilePath } = getDistFilePaths(config, Iife);
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
export const command = (config: Config): types.Command => {
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
export const run = (config: Config): ReturnType<typeof runSltr> =>
  runSltr(command(config));
