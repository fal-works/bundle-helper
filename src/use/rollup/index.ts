import rollupApi = require("rollup");
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { cmdEx, types } from "@fal-works/s-l-t-r";

import {
  DistType,
  getDistFilePath,
  BundleConfig,
  MiscConfig,
  createBanners,
} from "../../common";
import generalConfig = require("../../general-config/internal");

const createPlugins = () => [nodeResolve()];

type RollupFormat = rollupApi.OutputOptions["format"];

const rollupFormatTable = new Map<DistType, RollupFormat>();
rollupFormatTable.set(DistType.Iife, "iife");
rollupFormatTable.set(DistType.Esm, "es");
rollupFormatTable.set(DistType.Cjs, "cjs");

const getRollupFormat = (distType: DistType) => {
  const format = rollupFormatTable.get(distType);
  if (!format) throw `Unknown lib type: ${distType}`;
  return format;
};

/** Config fields required by `commandFromConfig()`. */
export interface RollupConfig extends BundleConfig, MiscConfig {
  tsOutDir: string;
  rollupAllowUnsafe?: boolean;
  rollupOptions?: {
    input?: rollupApi.InputOptions;
    output?: rollupApi.OutputOptions;
  };
}

interface Options {
  inputOptions: rollupApi.InputOptions;
  outputOptions: rollupApi.OutputOptions;
}

/** @returns Options to be passed to `execute()` or `command()` */
export const convertConfig = (
  config: RollupConfig,
  distType: DistType
): Options => {
  const overrides = config.rollupOptions || {};
  const allowUnsafe = config.rollupAllowUnsafe !== false;

  const inputFileName = config.srcEntryFileName.replace("ts", "js");
  const baseInputOptions: rollupApi.InputOptions = {
    input: `${config.tsOutDir}/${inputFileName}`,
    external: config.external,
    plugins: createPlugins(),
    treeshake: allowUnsafe ? { propertyReadSideEffects: false } : undefined,
  };
  const inputOptions: rollupApi.InputOptions = Object.assign(
    baseInputOptions,
    overrides.input
  );

  const banner = config.bannerContent
    ? createBanners(config.bannerContent)
    : undefined;

  const baseOutputOptions: rollupApi.OutputOptions = {
    file: getDistFilePath(config, distType),
    format: getRollupFormat(distType),
    name: config.iifeVarName,
    sourcemap: config.sourceMap,
    banner,
    interop: allowUnsafe ? "default" : undefined,
  };
  const outputOptions: rollupApi.OutputOptions = Object.assign(
    baseOutputOptions,
    overrides.output
  );

  if (generalConfig.printsGeneratedOptions) {
    console.log("Generated input options for rollup:");
    console.log(inputOptions);
    console.log("Generated output options for rollup:");
    console.log(outputOptions);
  }

  return {
    inputOptions,
    outputOptions,
  };
};

type MaybeArray<T> = T | T[];

/** Immediately runs `rollup.watch()`. */
export const watch = (
  config: MaybeArray<rollupApi.RollupWatchOptions>
): rollupApi.RollupWatcher => rollupApi.watch(config);

/** Immediately runs rollup. */
export async function execute(
  inputOptions: rollupApi.InputOptions,
  outputOptions: rollupApi.OutputOptions
): Promise<void> {
  const generator = await rollupApi.rollup(inputOptions);

  await generator.write(outputOptions);

  generator.close();
}

/** @returns Command object that runs rollup. */
export const command = (
  inputOptions: rollupApi.InputOptions,
  outputOptions: rollupApi.OutputOptions
): types.Command => cmdEx(() => execute(inputOptions, outputOptions), `rollup`);

export const commandFromConfig = (config: RollupConfig) => (
  distType: DistType
): types.Command => {
  const { inputOptions, outputOptions } = convertConfig(config, distType);
  return cmdEx(
    () => execute(inputOptions, outputOptions),
    `rollup ${distType}`
  );
};
