const path = require('path');

module.exports = function (api) {
  api && api.cache(true);
  const presets = [
    [
      '@babel/preset-env',
      {
        // "modules": false,
        loose: true,
        targets: {
          node: 'current',
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
        }
      }
    ]
  ];
  const plugins = [
    '@babel/plugin-transform-runtime',
    'transform-vue-jsx',
    'transform-flow-strip-types',
    '@babel/plugin-transform-modules-commonjs',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true
      }
    ]
  ];

  return {
    presets,
    plugins,
    ignore: [path.resolve(__dirname, '../core/libs/mapboxgl')]
  };
};
