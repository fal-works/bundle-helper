import esbuildApi = require("esbuild");
import { cmdEx, types } from "@fal-works/s-l-t-r";
import {
  BundleDistConfig,
  getDistFilePaths,
  BrowserDistType,
} from "../../common";
import generalConfig = require("../../general-config/internal");

const returnVoid = () => {};

export interface EsbuildMinifyConfig extends BundleDistConfig {
  esbuildMinifyOptions?: esbuildApi.BuildOptions;
}

/** @returns Options to be passed to `commandFromConfig()`. */
export const convertConfig = (config: EsbuildMinifyConfig) => (
  distType: BrowserDistType
): esbuildApi.BuildOptions => {
  const { distFilePath, minFilePath } = getDistFilePaths(config, distType);

  const baseOptions: esbuildApi.BuildOptions = {
    entryPoints: [distFilePath],
    outfile: minFilePath,
    minify: true,
  };
  const options = Object.assign(baseOptions, config.esbuildMinifyOptions);

  if (generalConfig.printsGeneratedOptions) {
    console.log("Generated options for minify with esbuild:");
    console.log(options);
  }

  return options;
};

/** @returns `Command` that runs esbuild for minifying purpose. */
export const commandFromConfig = (config: EsbuildMinifyConfig) => (
  distType: BrowserDistType
): types.Command => {
  const options = convertConfig(config)(distType);
  return cmdEx(
    () => esbuildApi.build(options).then(returnVoid),
    `esbuild minify ${distType}`
  );
};
