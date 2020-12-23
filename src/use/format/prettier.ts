import { cmd, exec } from "@fal-works/s-l-t-r";
import { Command } from "@fal-works/s-l-t-r/types/command/types";

/** Immediately runs prettier. */
export const execute = (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Promise<void> => exec("prettier", prettierOptions, `"${filesPattern}"`);

/** @returns `Command` that runs prettier. */
export const command = (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Command => cmd("prettier", prettierOptions, `"${filesPattern}"`);
