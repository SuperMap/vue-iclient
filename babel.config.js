module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        // "modules": false,
        "targets": {
          "node": 'current',
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
        }
      }
    ]
  ];
  const plugins = [
    "@babel/plugin-transform-runtime",
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    "transform-flow-strip-types"
  ];

  return {
    presets,
    plugins
  };
}
