import { transformFiles } from "@fal-works/mere-file-transformer";
import * as replaceStream from "replacestream";
import { cmdEx } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";

/** Prepares function for `execPreFormat()` and `preFormatCommand()`. */
const createExecute = (filesPattern: string): (() => Promise<void>) => {
  const lineBeforeBlockComment = () =>
    replaceStream(/(.)(\n *\/\*\*)/gm, "$1\n$2");

  const preFormatFiles = transformFiles(lineBeforeBlockComment);

  return () => preFormatFiles(filesPattern);
};

/**
 * Runs immediately pre-formatting.
 * @see `preFormatCommand()`
 */
export const execute = (filesPattern: string): Promise<void> =>
  createExecute(filesPattern)();

/**
 * Returns `Command` that inserts empty lines before block comments.
 *
 * Workaround for:
 * https://github.com/typescript-eslint/typescript-eslint/issues/1150
 */
export const command = (filesPattern: string): Command =>
  cmdEx(createExecute(filesPattern), `pre-format`);
