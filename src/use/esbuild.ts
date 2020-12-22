import * as esbuildApi from "esbuild";
import { cmdEx, types } from "@fal-works/s-l-t-r";
import { getDistFilePaths, BrowserDistType } from "../distribution";
import { DistConfig } from "../distribution";

const returnVoid = () => {};

export const command = (options: esbuildApi.BuildOptions): types.Command =>
  cmdEx(() => esbuildApi.build(options).then(returnVoid), `esbuild`);

export const convertConfigMinify = (config: DistConfig) => (
  distType: BrowserDistType
): esbuildApi.BuildOptions => {
  const { distFilePath, minFilePath } = getDistFilePaths(config, distType);

  return {
    entryPoints: [distFilePath],
    outfile: minFilePath,
    minify: true,
  };
};

export const commandFromConfigMinify = (config: DistConfig) => (
  distType: BrowserDistType
): types.Command => {
  const options = convertConfigMinify(config)(distType);
  return cmdEx(
    () => esbuildApi.build(options).then(returnVoid),
    `esbuild minify ${distType}`
  );
};
