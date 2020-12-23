import { DistType } from "./distribution";

export type EcmaVersion =
  | "es5"
  | "es2015"
  | "es2016"
  | "es2017"
  | "es2018"
  | "es2019";

export type EcmaVersionNumber = 5 | 2015 | 2016 | 2017 | 2018 | 2019;

const ecmaVersionNumberTable: Record<EcmaVersion, EcmaVersionNumber> = {
  es5: 5,
  es2015: 2015,
  es2016: 2016,
  es2017: 2017,
  es2018: 2018,
  es2019: 2019,
} as const;

export const distTypeEcmaVersionTable: Record<string, EcmaVersion> = {
  iife: "es2015",
  esm: "es2019",
  cjs: "es2019",
};

/** @returns Corresponding ECMAScript version (such as `"es2015"`). */
export const getDistEcmaVersion = (distType: DistType): EcmaVersion => {
  const ver = distTypeEcmaVersionTable[distType];
  if (!ver) throw `Invalid distribution type: ${distType}`;
  return ver;
};

/** @returns Corresponding ECMAScript version number (such as `2015`). */
export const getDistEcmaVersionNumber = (
  distType: DistType
): EcmaVersionNumber => {
  const ver = getDistEcmaVersion(distType);
  const num = ecmaVersionNumberTable[ver];
  return num;
};
