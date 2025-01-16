const path = require('path');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
const os = require('os');
const threads = os.cpus().length - 1;
const TerserPlugin = require('terser-webpack-plugin');
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
// const smp = new SpeedMeasurePlugin();
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  stories: ['../stories/**/*.stories.@(js)'],
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
    config.module.noParse = /(mapbox-gl-enhance)\.js$/;
    config.resolve.alias['vue-iclient'] = resolve('./');
    config.resolve.alias['@supermapgis/vue-iclient-mapboxgl/static'] = resolve('./static');
    config.resolve.alias['@supermapgis/vue-iclient-mapboxgl/lib'] = resolve('./lib/mapboxgl');
    config.resolve.alias['@supermapgis/vue-iclient-mapboxgl'] = resolve('./lib/mapboxgl');
    config.optimization = {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /node_modules/,
            name: 'vendors',
            minChunks: 1,
            chunks: 'initial',
            minSize: 0,
            priority: 1
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            chunks: 'initial',
            minSize: 0
          }
        },
        chunks: 'all',
        minSize: 30 * 1024, // 30KB
        maxSize: 1024 * 1024 // 1MB
      },
      minimizer: [
        new TerserPlugin({
          parallel: threads // 开启多进程
        })
      ]
    };
    config.resolve.extensions = ['.js', '.ts', '.json'];
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
        cacheDirectory: true, // 开启babel编译缓存
        cacheCompression: false, // 缓存文件不要压缩
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
