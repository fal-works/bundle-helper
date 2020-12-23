import { cmd, exec, types } from "@fal-works/s-l-t-r";

export interface TscConfig {
  tscArgs?: string[];
  tscAddRecommendedOptions?: boolean;
}

const recommendedOptions: readonly string[] = [
  "--alwaysStrict",
  "--skipLibCheck",
  "--noStrictGenericChecks",
  "--newLine lf",
];

/** Immediately runs `tsc`. */
export const execute = (
  tscArgs: string[] = [],
  addRecommendedOptions = true
): Promise<void> => {
  const options = tscArgs.concat(
    addRecommendedOptions ? recommendedOptions : []
  );
  return exec("tsc", ...options);
};

/** @returns `Command` object that runs `tsc`. */
export const command = (config: TscConfig): types.Command => {
  const userOptions = config.tscArgs || [];
  const recommended =
    config.tscAddRecommendedOptions !== false ? recommendedOptions : [];
  const name = ["tsc"].concat(userOptions).join(" ");
  return cmd("tsc", ...userOptions.concat(recommended)).rename(name);
};
