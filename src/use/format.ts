import { transformFiles } from "@fal-works/mere-file-transformer";
import * as replaceStream from "replacestream";
import { seq, cmdEx, cmd } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";

/**
 * Inserts empty lines before block comments.
 * Workaround for:
 * https://github.com/typescript-eslint/typescript-eslint/issues/1150
 */
const preFormat = (filesPattern: string): Command => {
  const lineBeforeBlockComment = () =>
    replaceStream(/(.)(\n *\/\*\*)/gm, "$1\n$2");

  const preFormatFiles = transformFiles(lineBeforeBlockComment);

  return cmdEx(() => preFormatFiles(filesPattern), `pre-format`);
};

/** Runs prettier. */
const prettier = (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Command => cmd("prettier", prettierOptions, `"${filesPattern}"`);

/** Applies both `preFormat()` and `prettier()`. */
const format = (filesPattern: string): Command =>
  seq(preFormat(filesPattern), prettier(filesPattern)).rename(
    `format ${filesPattern}`
  );

export { preFormat, prettier, format };
