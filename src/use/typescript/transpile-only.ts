import { cmdEx, types } from "@fal-works/s-l-t-r";
import * as fs from "fs";
import * as ts from "typescript";
import { DistType } from "../../common";
import { convertConfig, TsConfig } from "./options";

const sliceAfterLast = (s: string, delimiter: string): string =>
  s.slice(s.lastIndexOf(delimiter) + 1);
const returnVoid = () => {};

const createExecute = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): (() => Promise<void>) => async () => {
  const srcData = (await fs.promises.readFile(srcFilePath)).toString();
  const result = ts.transpileModule(srcData, transpileOptions);

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

type ExecuteFunction = (
  srcFilePath: string,
  distFilePath: string
) => Promise<void>;

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

type CommandFunction = (
  srcFilePath: string,
  distFilePath: string
) => types.Command;

/** Prepares `Command` that runs `ts.transpileModule()` using `config`. */
export const commandFromConfig = (config: TsConfig) => (
  distType: DistType
): CommandFunction => {
  const compilerOptions = convertConfig(config, distType);
  return (srcFilePath, distFilePath) =>
    command(srcFilePath, distFilePath, { compilerOptions });
};
