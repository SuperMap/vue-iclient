'use strict';

module.exports = function getOriginArgs() {
  let origin = [];
  try {
    if (process.env.npm_config_argv) {
      const npmArgv = JSON.parse(process.env.npm_config_argv);
      if (npmArgv && Array.isArray(npmArgv.original)) {
        origin = npmArgv.original;
      }
    }
  } catch (e) {
    origin = [];
  }

  // Fallback for npm/pnpm versions that do not expose npm_config_argv.
  if (!origin.length && Array.isArray(process.argv)) {
    origin = process.argv.slice(2);
  }

  return origin;
};
