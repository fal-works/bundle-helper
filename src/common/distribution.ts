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

/** Config fields required for any type of distribution. */
export interface DistConfig {
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
