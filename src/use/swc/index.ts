import fs = require("fs");

import swc = require("@swc/core");
import {
  DistType,
  getDistEcmaVersion,
  MiscConfig,
  sliceAfterLast,
} from "../../common";
import { cmdEx } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";

export type SwcConfig = MiscConfig;

type OptionGenerator = (
  distType: DistType,
  loose?: boolean
) => (filePath: string) => swc.Options;

/**
 * Prepares options to be passed to
 * `executeTransform()` or `transformCommand()`.
 */
export const convertConfig = (config?: SwcConfig): OptionGenerator => {
  const sourceMaps = config ? config.sourceMap : undefined;

  return (distType: DistType, loose?: boolean) => {
    const target = getDistEcmaVersion(distType);

    return (filePath: string): swc.Options => {
      const filename = sliceAfterLast(filePath, "/");
      const extension = sliceAfterLast(filename, ".");
      const isTs = extension === "ts" || extension === "tsx";

      return {
        filename,
        sourceMaps,
        jsc: {
          parser: {
            syntax: isTs ? "typescript" : "ecmascript",
            jsx: extension === "jsx",
            tsx: extension === "tsx",
          },
          target,
          loose,
        },
      };
    };
  };
};

const returnVoid = () => {};

const createExecuteTransform = (
  srcFilePath: string,
  distFilePath: string,
  options?: swc.Options
): (() => Promise<void>) => async () => {
  const output = await swc.transformFile(srcFilePath, options);

  const saveCode = fs.promises.writeFile(distFilePath, output.code);
  if (!output.map) return saveCode;

  const mapPath = distFilePath + ".map";
  const mapFileName = sliceAfterLast(mapPath, "/");
  const saveMap = fs.promises.writeFile(mapPath, output.map);
  const appendMapPath = () =>
    fs.promises.appendFile(
      distFilePath,
      `\n//# sourceMappingURL=${mapFileName}\n`
    );

  return Promise.all([saveCode.then(appendMapPath), saveMap]).then(returnVoid);
};

/** Immediately runs `swc.transformFile()` and saves the result. */
export const executeTransform = async (
  srcFilePath: string,
  distFilePath: string,
  options?: swc.Options
): Promise<void> =>
  createExecuteTransform(srcFilePath, distFilePath, options)();

/** Creates `Command` that runs `swc.transformFile()` and saves the result. */
export const transformCommand = (
  srcFilePath: string,
  distFilePath: string,
  options?: swc.Options
): Command =>
  cmdEx(
    createExecuteTransform(srcFilePath, distFilePath, options),
    `swc ${srcFilePath}`
  );
