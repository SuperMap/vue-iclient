'use strict';
const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const outputFileName = 'iclient-mapboxgl-vue';
const env = process.env.NODE_ENV === 'testing' ? require('../config/test.env') : require('../config/prod.env');

const isMinify = process.argv.includes('-p');
const pkg = require('../package.json');

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders({
      // sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  // devtool: config.build.productionSourceMap ? config.build.devtool : false,
  entry: {
    app: ['./src/mapboxgl/index.ts']
  },
  output: {
    path: path.resolve(__dirname, '../dist/mapboxgl'),
    filename: isMinify ? `${outputFileName}.min.js` : `${outputFileName}.js`,
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: ['SuperMap', 'Components']
  },
  externals: [
    {
      vue: {
        root: 'Vue',
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue'
      },
      echarts: 'echarts',
      'vue-echarts': {
        root: 'VueECharts',
        commonjs: 'vue-echarts',
        commonjs2: 'vue-echarts',
        amd: 'vue-echarts'
      },
      'ant-design-vue': {
        root: 'antd',
        commonjs: 'ant-design-vue',
        commonjs2: 'ant-design-vue',
        amd: 'ant-design-vue'
      },
      xlsx: {
        root: 'XLSX',
        commonjs: 'xlsx',
        commonjs2: 'xlsx',
        amd: 'xlsx'
      },
      shapefile: 'shapefile',
      'echarts-liquidfill': 'echarts-liquidfill',
      mapv: 'mapv',
      '@mapbox/mapbox-gl-draw': {
        root: 'MapboxDraw',
        commonjs: '@mapbox/mapbox-gl-draw',
        commonjs2: '@mapbox/mapbox-gl-draw',
        amd: '@mapbox/mapbox-gl-draw'
      },
      three: {
        root: 'THREE',
        commonjs: 'three',
        commonjs2: 'three',
        amd: 'three'
      },
      'video.js': {
        root: '_videojs',
        commonjs: 'video.js',
        commonjs2: 'video.js',
        amd: 'video.js'
      }
    },
    /// \/static\/libs\//,
    function(context, request, callback) {
      if (/\/static\/libs\/mapboxgl\/mapbox-gl-enhance/.test(request)) {
        return callback(null, {
          root: 'mapboxgl',
          commonjs: '../../static/libs/mapboxgl/mapbox-gl-enhance.js',
          commonjs2: '../../static/libs/mapboxgl/mapbox-gl-enhance.js',
          amd: '../../static/libs/mapboxgl/mapbox-gl-enhance.js'
        });
      }
      if (/\/static\/libs\/deckgl\/deck.gl/.test(request)) {
        return callback(null, {
          root: 'DeckGL',
          commonjs: '../../static/libs/deckgl/deck.gl.min.js',
          commonjs2: '../../static/libs/deckgl/deck.gl.min.js',
          amd: '../../static/libs/deckgl/deck.gl.min.js'
        });
      }
      if (/\/static\/libs\/echarts-layer\/EchartsLayer/.test(request)) {
        return callback(null, {
          root: 'EchartsLayer',
          commonjs: '../../static/libs/echarts-layer/EchartsLayer.js',
          commonjs2: '../../static/libs/echarts-layer/EchartsLayer.js',
          amd: '../../static/libs/echarts-layer/EchartsLayer.js'
        });
      }
      if (/\/static\/libs\/iclient-mapboxgl\/iclient-mapboxgl/.test(request)) {
        return callback(null, {
          root: 'SuperMap',
          commonjs: '../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
          commonjs2: '../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
          amd: '../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js'
        });
      }
      callback();
    }
  ],
  optimization: {
    minimizer: []
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new VueLoaderPlugin(),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: isMinify ? `${outputFileName}.min.css` : `${outputFileName}.css`
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.BannerPlugin(`
    ${pkg.name}.(${pkg.homepage})
    Copyright© 2000 - 2020 SuperMap Software Co.Ltd
    license: ${pkg.license}
    version: v${pkg.version}
   `),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static/index.js'),
        to: path.resolve(__dirname, '../dist/mapboxgl')
      }
    ])
  ]
});

if (isMinify) {
  webpackConfig.optimization.minimizer.push(
    new OptimizeCSSAssetsPlugin({}),
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: config.build.productionSourceMap,
      uglifyOptions: {
        warnings: false
      }
    })
  );
}

// if (config.build.productionGzip) {
//   const CompressionWebpackPlugin = require('compression-webpack-plugin')

//   webpackConfig.plugins.push(
//     new CompressionWebpackPlugin({
//       asset: '[path].gz[query]',
//       algorithm: 'gzip',
//       test: new RegExp(
//         '\\.(' +
//         config.build.productionGzipExtensions.join('|') +
//         ')$'
//       ),
//       threshold: 10240,
//       minRatio: 0.8
//     })
//   )
// }

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
