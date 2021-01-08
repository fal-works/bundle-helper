const sltr = require("@fal-works/s-l-t-r");
const { cmd, seq, builtin } = sltr;
const { cleandir } = builtin;

// ---------------------------------------------------------------------------

const distDir = "lib";

// ---------------------------------------------------------------------------

const clean = cleandir(distDir).rename("clean");

const tsc = cmd("tsc", "--skipLibCheck");

const format = cmd("eslint", "--fix", `${distDir}/**/*.{js,d.ts}`)
  .rename("format js & d.ts")
  .collapse();

const build = seq(clean, tsc, format).hide();

// ---------------------------------------------------------------------------

const router = sltr.tools.createRouter({ build, clean, tsc, format }, build);

router.run(process.argv[2]);
