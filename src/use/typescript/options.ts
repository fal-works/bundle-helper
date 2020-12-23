import * as ts from "typescript";
import { DistType } from "../../common";

export interface TsConfig {
  tsCompilerOptions?: ts.CompilerOptions;
}

export const convertConfig = (
  config: TsConfig,
  distType: DistType,
  addRecommendedOptions = true
): ts.CompilerOptions => {
  let moduleKind: ts.ModuleKind;
  let target: ts.ScriptTarget;
  switch (distType) {
    case DistType.Iife:
      moduleKind = ts.ModuleKind.ESNext; // Will be bundled later
      target = ts.ScriptTarget.ES2015;
      break;
    case DistType.Esm:
      moduleKind = ts.ModuleKind.ESNext;
      target = ts.ScriptTarget.ESNext;
      break;
    case DistType.Cjs:
      moduleKind = ts.ModuleKind.CommonJS;
      target = ts.ScriptTarget.ES2019;
      break;
  }

  const options: ts.CompilerOptions = {
    module: moduleKind,
    target,
    alwaysStrict: addRecommendedOptions ? true : undefined,
    newLine: addRecommendedOptions ? ts.NewLineKind.LineFeed : undefined,
  };

  return Object.assign(options, config.tsCompilerOptions);
};
