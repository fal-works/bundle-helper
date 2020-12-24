import sltr = require("@fal-works/s-l-t-r");
import preFormat = require("./pre-format");
import prettier = require("./prettier");

/** Immediately runs `preFormat.execute()` and then `prettier.execute()`. */
export const execute = async (
  filesPattern: string,
  prettierOptions = "--write --loglevel warn"
): Promise<void> => {
  await preFormat.execute(filesPattern);
  await prettier.execute(filesPattern, prettierOptions);
};

/**
 * Returns `Command` that includes both
 * `preFormat.command()` and `prettier.command()`.
 */
export const command = (filesPattern: string): sltr.types.Command =>
  sltr
    .seq(preFormat.command(filesPattern), prettier.command(filesPattern))
    .rename(`format ${filesPattern}`)
    .collapse();

export { preFormat, prettier };
