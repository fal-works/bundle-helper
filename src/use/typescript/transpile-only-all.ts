import { cmdEx, types } from "@fal-works/s-l-t-r";
import ts = require("typescript");
import { DistType } from "../../common";
import glob = require("../glob");

import { convertConfig, TsConfig } from "./options";
import transpile = require("./transpile-only");
import { ExecuteFunction, CommandFunction } from "./internal-types";

const createTranspileFile = (
  srcDir: string,
  distDir: string,
  tsOptions: ts.TranspileOptions
) => (srcFile: string) => {
  const distFile = srcFile.replace(srcDir, distDir);
  return transpile.execute(srcFile, distFile, tsOptions);
};

const createExecute = (
  srcDir: string,
  distDir: string,
  tsOptions: ts.TranspileOptions
) => {
  const transpileFile = createTranspileFile(srcDir, distDir, tsOptions);
  return () => glob.execute(transpileFile)(`${srcDir}/**/*.{ts,tsx}}`);
};

/** Immediately runs `ts.transpileModule()` for each source file. */
export const execute = (
  srcDir: string,
  distDir: string,
  tsOptions: ts.TranspileOptions
): Promise<void> => createExecute(srcDir, distDir, tsOptions)();

/** Prepares `execute()` using `config`. */
export const executeFromConfig = (config: TsConfig) => (
  distType: DistType
): ExecuteFunction => {
  const compilerOptions = convertConfig(config, distType);
  return (srcDir, distDir) => execute(srcDir, distDir, { compilerOptions });
};

/** Immediately runs `ts.transpileModule()` for each source file. */
export const command = (
  srcDir: string,
  distDir: string,
  tsOptions: ts.TranspileOptions
): types.Command =>
  cmdEx(createExecute(srcDir, distDir, tsOptions), `ts.transpile ${srcDir}`);

/** Prepares `execute()` using `config`. */
export const commandFromConfig = (config: TsConfig) => (
  distType: DistType
): CommandFunction => {
  const compilerOptions = convertConfig(config, distType);
  return (srcDir, distDir) => command(srcDir, distDir, { compilerOptions });
};
