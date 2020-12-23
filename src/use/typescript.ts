import { cmd, cmdEx, exec, types } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";
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
export const TscTranspile = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): Promise<void> =>
  createExecuteTranspile(srcFilePath, distFilePath, transpileOptions)();

/** Immediately runs `ts.transpileModule()`. */
export const transpileCommand = (
  srcFilePath: string,
  distFilePath: string,
  transpileOptions: ts.TranspileOptions
): Command =>
  cmdEx(
    createExecuteTranspile(srcFilePath, distFilePath, transpileOptions),
    `ts.transpile ${srcFilePath}`
  );

export interface TscConfig {
  tscArgs?: string[];
  tscAddRecommendedOptions?: boolean;
}

const recommendedTscOptions: readonly string[] = [
  "--alwaysStrict",
  "--skipLibCheck",
  "--noStrictGenericChecks",
  "--newLine lf",
];

/** Immediately runs `tsc`. */
export const executeTsc = (
  tscArgs: string[] = [],
  addRecommendedOptions = true
): Promise<void> => {
  const options = tscArgs.concat(
    addRecommendedOptions ? recommendedTscOptions : []
  );
  return exec("tsc", ...options);
};

/** @returns `Command` object that runs `tsc`. */
export const tscCommand = (config: TscConfig): types.Command => {
  const userOptions = config.tscArgs || [];
  const recommended =
    config.tscAddRecommendedOptions !== false ? recommendedTscOptions : [];
  const name = ["tsc"].concat(userOptions).join(" ");
  return cmd("tsc", ...userOptions.concat(recommended)).rename(name);
};
