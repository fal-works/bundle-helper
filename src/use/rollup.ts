import * as rollupApi from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { cmdEx, types } from "@fal-works/s-l-t-r";

import { DistType, getDistFilePath, DistConfig } from "../distribution";

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

export interface RollupConfig extends DistConfig {
  srcEntryFileName: string;
  tsOutDir: string;
  iifeVarName?: string;
  banner?: string;
  external?: string[];
  iifeGlobals?: Record<string, string>;
  rollupPlugins?: rollupApi.Plugin[];
  sourceMap?: boolean;
}

interface Options {
  inputOptions: rollupApi.InputOptions;
  outputOptions: rollupApi.OutputOptions;
}

export const convertConfig = (
  config: RollupConfig,
  distType: DistType
): Options => {
  const plugins = config.rollupPlugins ? config.rollupPlugins : createPlugins();

  const inputOptions: rollupApi.InputOptions = {
    input: `${config.tsOutDir}/${config.srcEntryFileName.replace("ts", "js")}`,
    external: config.external,
    plugins,
  };

  if (distType === DistType.Iife && !config.iifeVarName)
    throw "Missing config property: iifeVarName";

  const outputOptions: rollupApi.OutputOptions = {
    file: getDistFilePath(config, distType),
    format: getRollupFormat(distType),
    name: config.iifeVarName,
    sourcemap: config.sourceMap,
    banner: config.banner,
    globals: distType === DistType.Iife ? config.iifeGlobals : undefined,
  };

  return {
    inputOptions,
    outputOptions,
  };
};

export async function execute(
  inputOptions: rollupApi.InputOptions,
  outputOptions: rollupApi.OutputOptions
): Promise<void> {
  const generator = await rollupApi.rollup(inputOptions);

  await generator.write(outputOptions);

  generator.close();
}

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
