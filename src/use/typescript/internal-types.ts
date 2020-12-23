import { types } from "@fal-works/s-l-t-r";

export type ExecuteFunction = (
  srcFilePath: string,
  distFilePath: string
) => Promise<void>;

export type CommandFunction = (
  srcFilePath: string,
  distFilePath: string
) => types.Command;
