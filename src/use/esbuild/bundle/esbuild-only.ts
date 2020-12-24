import esbuildApi = require("esbuild");
import { cmdEx, types } from "@fal-works/s-l-t-r";
import {
  BundleConfig,
  getDistFilePath,
  BrowserDistType,
  getDistEcmaVersion,
  createBanners,
} from "../../../common";

const returnVoid = () => {};

export interface EsbuildBundleConfig extends BundleConfig {
  srcDir: string;
  esbuildBundleOptions?: esbuildApi.BuildOptions;
}

/** @returns Options to be passed to `commandFromConfig()`. */
export const convertConfig = (config: EsbuildBundleConfig) => (
  distType: BrowserDistType
): esbuildApi.BuildOptions => {
  const distFilePath = getDistFilePath(config, distType);
  const banner = config.bannerContent
    ? createBanners(config.bannerContent)
    : undefined;

  const baseOptions: esbuildApi.BuildOptions = {
    format: distType,
    target: getDistEcmaVersion(distType),
    banner,
    bundle: true,
    outfile: distFilePath,
    platform: "browser",
    external: config.external,
    entryPoints: [`${config.srcDir}/${config.srcEntryFileName}`],
    globalName: config.iifeVarName,
  };
  return Object.assign(baseOptions, config.esbuildBundleOptions);
};

/** @returns `Command` that runs esbuild for bundling purpose. */
export const command = (config: EsbuildBundleConfig) => (
  distType: BrowserDistType
): types.Command => {
  const options = convertConfig(config)(distType);
  return cmdEx(
    () => esbuildApi.build(options).then(returnVoid),
    `esbuild bundle ${distType}`
  );
};
