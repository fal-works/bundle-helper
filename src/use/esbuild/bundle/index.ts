import sltr = require("@fal-works/s-l-t-r");
import common = require("../../../common");
import esbuildOnly = require("./esbuild-only");
import postProcess = require("./post-process");

/**
 * Returns `Command` that runs esbuild for bundling purpose and then
 * post-process related to external variables.
 */
export const command = (
  config: esbuildOnly.EsbuildBundleConfig
): ((distType: common.BrowserDistType) => sltr.types.Command) => {
  const esbuildCommand = esbuildOnly.command(config);
  const { external } = config;

  return (distType) => {
    const runEsbuild = esbuildCommand(distType);
    if (!external) return runEsbuild;
    const distFilePath = common.getDistFilePath(config, distType);
    const runPostProcess = postProcess.command(distFilePath, external);
    console.log("dist file: " + distFilePath);

    return sltr.seq(runEsbuild, runPostProcess);
  };
};
