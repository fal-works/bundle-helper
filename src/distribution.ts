export const BrowserDistType = {
  Iife: "iife",
  Esm: "esm",
} as const;
export type BrowserDistType = typeof BrowserDistType[keyof typeof BrowserDistType];

export const DistType = {
  ...BrowserDistType,
  Cjs: "cjs",
} as const;
export type DistType = typeof DistType[keyof typeof DistType];

export interface DistConfig {
  distName: string;
  distDir: string;
}

const distExtensionTable = {
  iife: ".js",
  esm: ".mjs",
  cjs: ".js",
} as const;

export const getDistExtension = (distType: DistType): ".js" | ".mjs" => {
  const ext = distExtensionTable[distType];
  if (!ext) throw `Invalid distribution type: ${distType}`;
  return ext;
};

export const getDistFilePath = (
  config: DistConfig,
  distType: DistType
): string => {
  const extension = getDistExtension(distType);
  const { distDir, distName } = config;

  return `${distDir}/${distName}${extension}`;
};

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
