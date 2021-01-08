/**
 * bundle-helper
 * Helps bundle using s-l-t-r.
 * https://fal-works.github.io/bundle-helper/
 * @copyright 2020 FAL
 * @license MIT
 * @version 0.3.1
 */

"use strict";

export * as types from "./types";

const log = (s: string) => console.log(s);

console.group("\n[bundle-helper]");
log("You have to individually require each module you want to use.");
log("For example:");
console.group();
log('  const minifier = require("@fal-works/bundle-helper/lib/use/terser");');
log('  const minify = minifier.command("src.js", "dest.js");');
console.groupEnd();
log("");
console.groupEnd();
