import { transformFiles } from "@fal-works/mere-file-transformer";
import * as replaceStream from "replacestream";
import { seq, cmdEx, cmd } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";

/**
 * Returns `Command` that inserts empty lines before block comments.
 *
 * Workaround for:
 * https://github.com/typescript-eslint/typescript-eslint/issues/1150
 *
 * Needs following libraries to be installed:
 * - @fal-works/mere-file-transformer
 * - replacestream
 */
const preFormat = (filesPattern: string): Command => {
  const lineBeforeBlockComment = () =>
    replaceStream(/(.)(\n *\/\*\*)/gm, "$1\n$2");

  const preFormatFiles = transformFiles(lineBeforeBlockComment);

  return cmdEx(() => preFormatFiles(filesPattern), `pre-format`);
};

/** @returns `Command` that runs prettier. */
const prettier = (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Command => cmd("prettier", prettierOptions, `"${filesPattern}"`);

/** @returns `Command` that applies both `preFormat()` and `prettier()`. */
const format = (filesPattern: string): Command =>
  seq(preFormat(filesPattern), prettier(filesPattern))
    .rename(`format ${filesPattern}`)
    .collapse();

export { preFormat, prettier, format };
