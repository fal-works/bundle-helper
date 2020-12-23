import {
  DistType,
  BrowserDistType,
  DistConfig,
  getDistExtension,
} from "./distribution";

/**
 * Common config fields required for distributing bundled code.
 * `distName` should be the distribution file name (without `.js`).
 */
export interface BundleDistConfig extends DistConfig {
  bundleDistName: string;
}

/**
 * Common config fields required for bundling.
 */
export interface BundleConfig extends BundleDistConfig {
  iifeVarName?: string;
  banner?: string;
  external?: string[];
}

/** @returns The distribution file path. */
export const getDistFilePath = (
  config: BundleDistConfig,
  distType: DistType
): string => {
  const extension = getDistExtension(distType);
  const { distDir, bundleDistName } = config;

  return `${distDir}/${bundleDistName}${extension}`;
};

/** @returns The distribution file paths with minified one added. */
export const getDistFilePaths = (
  config: BundleDistConfig,
  distType: BrowserDistType
): { distFilePath: string; minFilePath: string } => {
  const extension = getDistExtension(distType);
  const { distDir, bundleDistName } = config;

  const distFilePath = `${distDir}/${bundleDistName}${extension}`;
  const minFilePath = `${distDir}/${bundleDistName}.min${extension}`;

  return { distFilePath, minFilePath };
};
