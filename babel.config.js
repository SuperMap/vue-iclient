module.exports = function(api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        // "modules": false,
        targets: {
          node: 'current',
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
        }
      }
    ]
  ];
  const plugins = [
    '@babel/plugin-transform-runtime',
    'transform-flow-strip-types',
    '@babel/plugin-transform-modules-commonjs'
  ];

  return {
    presets,
    plugins,
    ignore: ['./static/libs/mapboxgl'],
  };
};
