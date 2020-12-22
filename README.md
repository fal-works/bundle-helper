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
const builder = require("@fal-works/bundle-helper/lib/build/for-browsers");
const build = builder.command({
  distName: "cool-library",
  distDir: "lib",
  typesDir: "types",
  tsOutDir: "out",
  iifeVarName: "cool",
  srcEntryFileName: "index.ts",
}); // returns s-l-t-r command
```


## Dependencies

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
  - terser/
    - terser
  - typescript/
    - typescript
