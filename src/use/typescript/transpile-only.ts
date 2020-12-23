import { cmdEx, types } from "@fal-works/s-l-t-r";
import fs = require("fs");
import ts = require("typescript");
import { DistType } from "../../common";
import { convertConfig, TsConfig } from "./options";
import { ExecuteFunction, CommandFunction } from "./internal-types";

const sliceAfterLast = (s: string, delimiter: string): string =>
  s.slice(s.lastIndexOf(delimiter) + 1);
const sliceBeforeLast = (s: string, delimiter: string): string =>
  s.slice(0, s.lastIndexOf(delimiter));

const returnVoid = () => {};
const mkdirOption = { recursive: true };

const createExecute = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): (() => Promise<void>) => async () => {
  const srcData = (await fs.promises.readFile(srcFilePath)).toString();
  const result = ts.transpileModule(srcData, transpileOptions);

  const distFileParentDir = sliceBeforeLast(distFilePath, "/");
  await fs.promises.mkdir(distFileParentDir, mkdirOption);

  const saveCode = fs.promises.writeFile(distFilePath, result.outputText);
  if (!result.sourceMapText) return saveCode;

  const mapPath = distFilePath + ".map";
  const mapFileName = sliceAfterLast(mapPath, "/");
  const saveMap = fs.promises.writeFile(mapPath, result.sourceMapText);
  const appendMapPath = () =>
    fs.promises.appendFile(
      distFilePath,
      `\n//# sourceMappingURL=${mapFileName}\n`
    );

  return Promise.all([saveCode.then(appendMapPath), saveMap]).then(returnVoid);
};

/** Immediately runs `ts.transpileModule()` and saves the result. */
export const execute = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): Promise<void> =>
  createExecute(srcFilePath, distFilePath, transpileOptions)();

/** Prepares `ts.transpileModule()` using `config`. */
export const executeFromConfig = (config: TsConfig) => (
  distType: DistType
): ExecuteFunction => {
  const compilerOptions = convertConfig(config, distType);
  return (srcFilePath, distFilePath) =>
    createExecute(srcFilePath, distFilePath, { compilerOptions })();
};

/** @returns `Command` that runs `ts.transpileModule()` and saves the result. */
export const command = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): types.Command =>
  cmdEx(
    createExecute(srcFilePath, distFilePath, transpileOptions),
    `ts.transpile ${srcFilePath}`
  );

/** Prepares `Command` that runs `ts.transpileModule()` using `config`. */
export const commandFromConfig = (config: TsConfig) => (
  distType: DistType
): CommandFunction => {
  const compilerOptions = convertConfig(config, distType);
  return (srcFilePath, distFilePath) =>
    command(srcFilePath, distFilePath, { compilerOptions });
};
