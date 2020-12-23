const sltr = require("@fal-works/s-l-t-r");
const { cmd, seq, par, builtin } = sltr;
const { cleandir } = builtin;

// ---------------------------------------------------------------------------

const distDir = "lib";
const typesDir = "types";

// ---------------------------------------------------------------------------

const clean = par(cleandir(distDir), cleandir(typesDir))
  .collapse()
  .rename("clean");

const tsc = cmd("tsc", "--skipLibCheck");

const formatDir = (dir, extension) =>
  cmd("eslint", "--fix", `${dir}/**/*${extension}`);

const format = par(formatDir(distDir, ".js"), formatDir(typesDir, ".d.ts"))
  .rename("format js & d.ts")
  .collapse();

const build = seq(clean, tsc, format).hide();

// ---------------------------------------------------------------------------

const router = sltr.tools.createRouter({ build, clean, tsc, format }, build);

router.run(process.argv[2]);
