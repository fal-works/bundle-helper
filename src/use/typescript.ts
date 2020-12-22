import { cmd, exec, types } from "@fal-works/s-l-t-r";

export interface TscConfig {
  tscArgs?: string[];
}

/** Immediately runs `tsc`. */
export const execute = (tscArgs?: string[]): Promise<void> =>
  tscArgs ? exec("tsc", ...tscArgs) : exec("tsc");

/** @returns `Command` object that runs `tsc`. */
export const command = (config: TscConfig): types.Command =>
  config.tscArgs ? cmd("tsc", ...config.tscArgs) : cmd("tsc");
