if (
  require.resolve("./format") &&
  require.resolve("./rollup") &&
  require.resolve("./terser") &&
  require.resolve("./typescript")
) {
  exports.browserModule = require("./browser-module");
}
