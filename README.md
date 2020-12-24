# bundle-helper

Helps bundle using [s-l-t-r](https://github.com/fal-works/s-l-t-r).

## Usage

You have to individually require each module you want.

For example:

```js
const minifier = require("@fal-works/bundle-helper/lib/use/terser");
const minify = minifier.command("src.js", "dest.js"); // returns s-l-t-r command
```

or:

```js
const builder = require("@fal-works/bundle-helper/lib/build/browser-module");
const build = builder.command({
  bundleDistName: "cool-library",
  distDir: "lib",
  typesDir: "types",
  tsOutDir: "out",
  iifeVarName: "cool",
  srcEntryFileName: "index.ts",
}); // returns s-l-t-r command
```


## Dependencies

The below are mandatory and automatically installed as they will be required in most cases:

- `@fal-works/s-l-t-r`
- `@fal-works/mere-file-transformer`
- `@types/replacestream`
- `prettier`
- `replacestream`
- `typescript`

In addition, some features require other modules as well, which you may have to install manually:

- build/
  - browser-app/
    - `rollup`
    - `@rollup/plugin-node-resolve`
    - `terser`
    - `fast-glob`
  - browser-module/
    - `rollup`
    - `@rollup/plugin-node-resolve`
    - `terser`
  - node-module/
    - \-
- use/
  - esbuild/
    - `esbuild`
  - format/
    - \-
  - glob/
    - `fast-glob`
  - rollup/
    - `rollup`
    - `@rollup/plugin-node-resolve`
  - swc/
    - `@swc/core`
  - terser/
    - `terser`
  - typescript/
    - tsc/
      - \-
    - transpile-only/
      - \-
    - transpile-only-all/
      - `fast-glob`
