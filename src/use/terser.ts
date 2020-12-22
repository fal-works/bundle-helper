import * as terserApi from "terser";

import * as fs from "fs";
import { cmdEx, types } from "@fal-works/s-l-t-r";
import { BrowserDistType, DistConfig, getDistFilePaths } from "../distribution";

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

interface Options {
  srcFilePath: string;
  destFilePath: string;
  terserOptions: terserApi.MinifyOptions;
}

export const convertConfig = (config: DistConfig) => (
  distType: BrowserDistType
): Options => {
  const { distFilePath, minFilePath } = getDistFilePaths(config, distType);
  const terserOptions: terserApi.MinifyOptions = {
    ecma: 2015,
    module: distType === BrowserDistType.Esm,
  };
  return {
    srcFilePath: distFilePath,
    destFilePath: minFilePath,
    terserOptions,
  };
};

export const command = (
  srcFilePath: string,
  destFilePath: string,
  terserOptions: terserApi.MinifyOptions = { ecma: 2015 }
): types.Command =>
  cmdEx(() => execute(srcFilePath, destFilePath, terserOptions), "terser");

export const commandFromConfig = (config: DistConfig) => (
  distType: BrowserDistType
): types.Command => {
  const options = convertConfig(config)(distType);
  const { srcFilePath, destFilePath, terserOptions } = options;

  return cmdEx(
    () => execute(srcFilePath, destFilePath, terserOptions),
    `terser ${distType}`
  );
};
