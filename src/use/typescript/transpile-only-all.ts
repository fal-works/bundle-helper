import { cmdEx, types } from "@fal-works/s-l-t-r";
import ts = require("typescript");
import * as glob from "../glob";
import * as transpile from "./transpile-only";

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

/** Immediately runs `ts.transpileModule()` for each source file. */
export const command = (
  srcDir: string,
  distDir: string,
  tsOptions: ts.TranspileOptions
): types.Command =>
  cmdEx(createExecute(srcDir, distDir, tsOptions), `ts.transpile ${srcDir}`);
