const path = require('path');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
const os = require('os');
const cpuCount = os.cpus().length;
const threads = Number(process.env.STORYBOOK_TERSER_PARALLEL) || Math.max(1, Math.min(cpuCount - 1, 2));
const TerserPlugin = require('terser-webpack-plugin');
const nodeModulesParse= require('../build/webpack.base.conf').nodeModulesParse;
consol.log(nodeModulesParse)
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
    config.resolve.alias['swiper/modules'] = resolve('./node_modules/swiper/modules/index.mjs');

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
          parallel: threads, // 开启多进程（已限制上限）
          cache: true // 开启文件系统缓存，二次构建跳过未变更 chunk
        })
      ]
    };
    config.devtool = false; // 关闭 source map，减少内存占用和构建时间
    config.resolve.extensions = ['.mjs', '.js', '.ts', '.json'];
    config.externals = [
      function (context, request, callback) {
        if (request === '@supermapgis/vue-iclient-mapboxgl') {
          return callback(null, {});
        }
        callback();
      }
    ];
    config.module.rules.push({
      test: /\.mjs$/,
      include: [
        resolve('./node_modules/ssr-window'),
        ...nodeModulesParse.map(item => resolve(item))
      ],
      type: 'javascript/auto',
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: false,
          presets: [['@babel/preset-env', { modules: false }]]
        }
      }
    });
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
