import terserApi = require("terser");

import fs = require("fs");
import { cmdEx, types } from "@fal-works/s-l-t-r";
import {
  BrowserDistType,
  BundleDistConfig,
  getDistFilePaths,
  getDistEcmaVersionNumber,
  sliceAfterLast,
} from "../../common";
import generalConfig = require("../../general-config/internal");

export interface TerserConfig extends BundleDistConfig {
  terserOptions?: terserApi.MinifyOptions;
}

interface Options {
  srcFilePath: string;
  destFilePath: string;
  terserOptions?: terserApi.MinifyOptions;
}

type OptionsGenerator = (distType: BrowserDistType) => Options;

const returnVoid = () => {};

/** @returns Options to be passed to `command()`. */
export const convertConfig = (config: TerserConfig): OptionsGenerator => {
  const { terserOptions: overrides } = config;

  return (distType) => {
    const { distFilePath, minFilePath } = getDistFilePaths(config, distType);
    const terserOptions: terserApi.MinifyOptions = {
      ecma: getDistEcmaVersionNumber(distType),
      module: distType === BrowserDistType.Esm,
      sourceMap: true,
    };
    Object.assign(terserOptions, overrides);

    if (generalConfig.printsGeneratedOptions) {
      console.log("Generated options for terser:");
      console.log(terserOptions);
    }

    return {
      srcFilePath: distFilePath,
      destFilePath: minFilePath,
      terserOptions,
    };
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

  const saveCode = fs.promises.writeFile(destFilePath, output.code);

  if (!output.map) return saveCode;

  const mapPath = destFilePath + ".map";
  const mapFileName = sliceAfterLast(mapPath, "/");
  const saveMap = fs.promises.writeFile(mapPath, output.map.toString());
  const appendMapPath = () =>
    fs.promises.appendFile(
      destFilePath,
      `\n//# sourceMappingURL=${mapFileName}\n`
    );

  return Promise.all([saveCode.then(appendMapPath), saveMap]).then(returnVoid);
};

/** @returns `Command` object that runs terser. */
export const command = (
  srcFilePath: string,
  destFilePath: string,
  terserOptions: terserApi.MinifyOptions = { ecma: 2015 }
): types.Command =>
  cmdEx(() => execute(srcFilePath, destFilePath, terserOptions), "terser");

/** @returns `Command` object that runs terser. */
export const commandFromConfig = (config: TerserConfig) => (
  distType: BrowserDistType
): types.Command => {
  const options = convertConfig(config)(distType);
  const { srcFilePath, destFilePath, terserOptions } = options;

  return cmdEx(
    () => execute(srcFilePath, destFilePath, terserOptions),
    `terser ${distType}`
  );
};
