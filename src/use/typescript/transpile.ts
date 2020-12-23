import { cmdEx, types } from "@fal-works/s-l-t-r";
import * as fs from "fs";
import * as ts from "typescript";

const sliceAfterLast = (s: string, delimiter: string): string =>
  s.slice(s.lastIndexOf(delimiter) + 1);
const returnVoid = () => {};

const createExecuteTranspile = (
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

/** Immediately runs `ts.transpileModule()`. */
export const execute = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): Promise<void> =>
  createExecuteTranspile(srcFilePath, distFilePath, transpileOptions)();

/** @returns `Command` that runs `ts.transpileModule()`. */
export const command = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): types.Command =>
  cmdEx(
    createExecuteTranspile(srcFilePath, distFilePath, transpileOptions),
    `ts.transpile ${srcFilePath}`
  );
