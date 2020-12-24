import { transformFile } from "@fal-works/mere-file-transformer";
import replaceStream = require("replacestream");
import { cmdEx } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";
import * as stream from "stream";

const removeRequire = (varName: string) =>
  replaceStream(
    new RegExp(
      `var +${varName} *= *__toModule\\(require\\("${varName}"\\)\\);`
    ),
    ""
  ) as stream.Transform;

const removeDefault = (varName: string) =>
  replaceStream(
    new RegExp(`${varName}.default([=( ])`, "g"),
    `${varName}$1`
  ) as stream.Transform;

const removeRequireDefault = (varName: string) => [
  removeRequire(varName),
  removeDefault(varName),
];

const functionify = <T>(v: T) => () => v;

/** Prepares function for `execute()` and `command()`. */
const createExecute = (
  filePath: string,
  external: string[]
): (() => Promise<void>) => {
  const rules = external.map(removeRequireDefault).flat().map(functionify);

  const postProcessFile = transformFile(rules);

  return () => postProcessFile(filePath);
};

/**
 * Runs immediately post-process.
 * @see `command()`
 */
export const execute = (filePath: string, external: string[]): Promise<void> =>
  createExecute(filePath, external)();

/**
 * Removes `require(...)` and `varName.default` related to
 * `external` variable names.
 * Related: https://github.com/evanw/esbuild/issues/337
 */
export const command = (filePath: string, external: string[]): Command =>
  cmdEx(createExecute(filePath, external), `esbuild bundle post-process`);
