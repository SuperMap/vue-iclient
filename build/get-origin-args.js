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

  // 发布脚本通过显式环境变量传递目标，避免 npm 版本改变时吞掉 -leaflet/-index 参数。
  if (['mapboxgl', 'leaflet'].includes(process.env.ICLIENT_ENGINE)) {
    origin.push(`-${process.env.ICLIENT_ENGINE}`);
  }
  if (process.env.ICLIENT_BUILD_INDEX === '1') {
    origin.push('-index');
  }

  return origin;
};
