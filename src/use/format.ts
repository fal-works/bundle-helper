import { transformFiles } from "@fal-works/mere-file-transformer";
import * as replaceStream from "replacestream";
import { seq, cmdEx, cmd, exec } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";

/** Prepares function for `execPreFormat()` and `preFormatCommand()`. */
const createExecutePreFormat = (
  filesPattern: string
): (() => Promise<void>) => {
  const lineBeforeBlockComment = () =>
    replaceStream(/(.)(\n *\/\*\*)/gm, "$1\n$2");

  const preFormatFiles = transformFiles(lineBeforeBlockComment);

  return () => preFormatFiles(filesPattern);
};

/**
 * Runs immediately pre-formatting.
 * @see `preFormatCommand()`
 */
export const executePreFormat = (filesPattern: string): Promise<void> =>
  createExecutePreFormat(filesPattern)();

/**
 * Returns `Command` that inserts empty lines before block comments.
 *
 * Workaround for:
 * https://github.com/typescript-eslint/typescript-eslint/issues/1150
 */
export const preFormatCommand = (filesPattern: string): Command =>
  cmdEx(createExecutePreFormat(filesPattern), `pre-format`);

/** Immediately runs prettier. */
export const executePrettier = (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Promise<void> => exec("prettier", prettierOptions, `"${filesPattern}"`);

/** @returns `Command` that runs prettier. */
export const prettierCommand = (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Command => cmd("prettier", prettierOptions, `"${filesPattern}"`);

/** Immediately runs `executePreFormat()` and then `executePrettier()`. */
export const execute = async (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Promise<void> => {
  await executePreFormat(filesPattern);
  await executePrettier(filesPattern, prettierOptions);
};

/** @returns `Command` that applies both `preFormat()` and `prettier()`. */
export const command = (filesPattern: string): Command =>
  seq(preFormatCommand(filesPattern), prettierCommand(filesPattern))
    .rename(`format ${filesPattern}`)
    .collapse();
