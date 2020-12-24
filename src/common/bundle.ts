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
  srcEntryFileName: string;
  iifeVarName?: string;
  bannerContent?: string | string[];
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

/** Wraps `content` with a JSDoc-style multiline comment. */
export const createBanner = (content: string): string => {
  if (!content.startsWith("\n") || !content.endsWith("\n"))
    throw "bannerContent must start and end with a newline.";

  let lines = content.slice(1, content.length - 1).split("\n");
  lines = lines.map((line) => ` * ${line}`);
  return `/**\n${lines.join("\n")}\n */\n`;
};

/**
 * Wraps each of `contents` with JSDoc-style multiline comment and
 * returns a joined string.
 */
export const createBanners = (contents: string | string[]): string => {
  if (typeof contents === "string") contents = [contents];
  return contents.map(createBanner).join("\n");
};
