import terserApi = require("terser");

import fs = require("fs");
import { cmdEx, types } from "@fal-works/s-l-t-r";
import {
  BrowserDistType,
  BundleDistConfig,
  getDistFilePaths,
  getDistEcmaVersionNumber,
} from "../../common";

interface Options {
  srcFilePath: string;
  destFilePath: string;
  terserOptions: terserApi.MinifyOptions;
}

/** @returns Options to be passed to `command()`. */
export const convertConfig = (config: BundleDistConfig) => (
  distType: BrowserDistType
): Options => {
  const { distFilePath, minFilePath } = getDistFilePaths(config, distType);
  const terserOptions: terserApi.MinifyOptions = {
    ecma: getDistEcmaVersionNumber(distType),
    module: distType === BrowserDistType.Esm,
  };
  return {
    srcFilePath: distFilePath,
    destFilePath: minFilePath,
    terserOptions,
  };
};

/** Immediately runs terser. */
export const execute = async (
  srcFilePath: string,
  destFilePath: string,
  terserOptions: terserApi.MinifyOptions = { ecma: 2015 }
): Promise<void> => {
  const inputCode = await fs.promises.readFile(srcFilePath);

  const output = await terserApi.minify(inputCode.toString(), terserOptions);
  if (!output.code) throw "terser failed to generate output code.";

  return await fs.promises.writeFile(destFilePath, output.code);
};

/** @returns `Command` object that runs terser. */
export const command = (
  srcFilePath: string,
  destFilePath: string,
  terserOptions: terserApi.MinifyOptions = { ecma: 2015 }
): types.Command =>
  cmdEx(() => execute(srcFilePath, destFilePath, terserOptions), "terser");

/** @returns `Command` object that runs terser. */
export const commandFromConfig = (config: BundleDistConfig) => (
  distType: BrowserDistType
): types.Command => {
  const options = convertConfig(config)(distType);
  const { srcFilePath, destFilePath, terserOptions } = options;

  return cmdEx(
    () => execute(srcFilePath, destFilePath, terserOptions),
    `terser ${distType}`
  );
};
