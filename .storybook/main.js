const path = require('path');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
module.exports = {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  // 没有用到 @storybook/addon-postcss,隐藏关于postcss的警告
  features: {
    postcss: false
  },
  addons: [
    '@storybook/preset-scss',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        sourceLoaderOptions: {
          injectStoryParameters: false
        }
      }
    },
    '@storybook/addon-knobs/register',
    '@storybook/addon-toolbars'
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.noParse = /(mapbox-gl-enhance)\.js$/,
    config.resolve.alias['vue-iclient'] = resolve('./');
    config.resolve.alias['@supermapgis/vue-iclient-mapboxgl/static'] = resolve('./static');
    config.resolve.alias['@supermapgis/vue-iclient-mapboxgl/lib'] = resolve('./lib/mapboxgl');
    config.resolve.alias['@supermapgis/vue-iclient-mapboxgl'] = resolve('./lib/mapboxgl');
    config.optimization = {
      splitChunks: {
        chunks: 'all',
        minSize: 30 * 1024, // 30KB
        maxSize: 1024 * 1024 // 1MB
      }
    };
    config.externals = [
      function (context, request, callback) {
        if (request === '@supermapgis/vue-iclient-mapboxgl') {
          return callback(null, {});
        }
        callback();
      }
    ];
    config.module.rules.push({
      test: /useLib\.js$/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: [
          ['@babel/plugin-proposal-private-methods', { loose: true }],
          ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
          [
            'import',
            {
              libraryName: '@supermapgis/vue-iclient-mapboxgl',
              style: name => {
                return `${name}/style/css`;
              },
              customName: name => {
                return `../lib/mapboxgl/${name}`;
              }
            }
          ]
        ]
      }
    });
    return config;
  }
};
