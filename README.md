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

`@fal-works/s-l-t-r` is mandatory and is installed automatically.

In addition, each feature requires different modules, which you may have to install manually:

- build/
  - for-browsers/
    - typescript
    - rollup
    - prettier
    - terser
    - @fal-works/mere-file-transformer
    - replacestream
- use/
  - esbuild/
    - esbuild
  - format/
    - prettier
    - @fal-works/mere-file-transformer
    - replacestream
  - rollup/
    - rollup
    - @rollup/plugin-node-resolve
  - swc/
    - @swc/core
  - terser/
    - terser
  - typescript/
    - typescript
