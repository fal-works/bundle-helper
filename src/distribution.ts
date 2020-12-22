/** Distribution type for browsers, either `"iife"` or `"esm"`. */
export const BrowserDistType = {
  Iife: "iife",
  Esm: "esm",
} as const;
export type BrowserDistType = typeof BrowserDistType[keyof typeof BrowserDistType];

/** Distribution type. `"iife"`, `"esm"` or `"cjs"`. */
export const DistType = {
  ...BrowserDistType,
  Cjs: "cjs",
} as const;
export type DistType = typeof DistType[keyof typeof DistType];

/**
 * Config fields required for creating distribution.
 * `distName` will be the distribution file name (without `.js`).
 */
export interface DistConfig {
  distName: string;
  distDir: string;
}

const distExtensionTable = {
  iife: ".js",
  esm: ".mjs",
  cjs: ".js",
} as const;

/** @returns Corresponding extension (either `".js"` or `".mjs"`) */
export const getDistExtension = (distType: DistType): ".js" | ".mjs" => {
  const ext = distExtensionTable[distType];
  if (!ext) throw `Invalid distribution type: ${distType}`;
  return ext;
};

/** @returns The distribution file path. */
export const getDistFilePath = (
  config: DistConfig,
  distType: DistType
): string => {
  const extension = getDistExtension(distType);
  const { distDir, distName } = config;

  return `${distDir}/${distName}${extension}`;
};

/** @returns The distribution file paths with minified one added. */
export const getDistFilePaths = (
  config: DistConfig,
  distType: BrowserDistType
): { distFilePath: string; minFilePath: string } => {
  const extension = getDistExtension(distType);
  const { distDir, distName } = config;

  const distFilePath = `${distDir}/${distName}${extension}`;
  const minFilePath = `${distDir}/${distName}.min${extension}`;

  return { distFilePath, minFilePath };
};
