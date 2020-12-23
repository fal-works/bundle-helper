import * as esbuildApi from "esbuild";
import { cmdEx, types } from "@fal-works/s-l-t-r";
import {
  BundleDistConfig,
  getDistFilePaths,
  BrowserDistType,
} from "../../common";

const returnVoid = () => {};

/** @returns Options to be passed to `commandFromConfig()`. */
export const convertConfig = (config: BundleDistConfig) => (
  distType: BrowserDistType
): esbuildApi.BuildOptions => {
  const { distFilePath, minFilePath } = getDistFilePaths(config, distType);

  return {
    entryPoints: [distFilePath],
    outfile: minFilePath,
    minify: true,
  };
};

/** @returns `Command` that runs esbuild for minifying purpose. */
export const commandFromConfig = (config: BundleDistConfig) => (
  distType: BrowserDistType
): types.Command => {
  const options = convertConfig(config)(distType);
  return cmdEx(
    () => esbuildApi.build(options).then(returnVoid),
    `esbuild minify ${distType}`
  );
};
