import esbuildApi = require("esbuild");
import { cmdEx, types } from "@fal-works/s-l-t-r";
import {
  BundleConfig,
  getDistFilePath,
  BrowserDistType,
  getDistEcmaVersion,
  createBanners,
} from "../../../common";
import generalConfig = require("../../../general-config/internal");

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
  const options = Object.assign(baseOptions, config.esbuildBundleOptions);

  if (generalConfig.printsGeneratedOptions) {
    console.log("Generated options for bundle with esbuild:");
    console.log(options);
  }

  return options;
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
