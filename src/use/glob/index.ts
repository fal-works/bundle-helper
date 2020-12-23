import { cmdEx, types } from "@fal-works/s-l-t-r";
import glob = require("fast-glob");
import { Options } from "fast-glob";

export type GlobOptions = Options;

const returnVoid = () => {};

const createExecute = (
  callback: (filePath: string) => Promise<void>,
  options?: GlobOptions
) => async (pattern: string | string[]) => {
  const files = await glob(pattern, options);
  const promises = files.map(callback);
  return Promise.all(promises).then(returnVoid);
};

/** @returns Function that immediately runs `callback` for each found file. */
export const execute = (
  callback: (filePath: string) => Promise<void>,
  options?: GlobOptions
): ((pattern: string | string[]) => Promise<void>) => {
  const exec = createExecute(callback, options);
  return async (pattern) => exec(pattern);
};

/**
 * Returns a function which creates `Command`
 * that runs `callback` for each found file.
 */
export const command = (
  callback: (filePath: string) => Promise<void>,
  options?: GlobOptions
): ((pattern: string | string[]) => types.Command) => {
  const exec = createExecute(callback, options);
  return (pattern) => cmdEx(() => exec(pattern));
};
