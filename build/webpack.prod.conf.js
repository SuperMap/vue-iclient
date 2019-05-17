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
const outputFileName = 'iclient9-mapboxgl-widgets-vue';
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
    app: ['./src/index.js']
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: isMinify ? `${outputFileName}.min.js` : `${outputFileName}.js`,
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: ['SuperMap', 'Widgets']
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
      xlsx: {
        root: 'XLSX',
        commonjs: '@mapbox/mapbox-gl-draw',
        commonjs2: '@mapbox/mapbox-gl-draw',
        amd: '@mapbox/mapbox-gl-draw'
      },
      shapefile: 'shapefile',
      'echarts-liquidfill': 'echarts-liquidfill',
      mapv: 'mapv',
      '@mapbox/mapbox-gl-draw': {
        root: 'MapboxDraw',
        commonjs: '@mapbox/mapbox-gl-draw',
        commonjs2: '@mapbox/mapbox-gl-draw',
        amd: '@mapbox/mapbox-gl-draw'
      }
    },
    /// \/static\/libs\//,
    function(context, request, callback) {
      if (/\/static\/libs\/mapboxgl\/mapbox-gl-enhance/.test(request)) {
        return callback(null, {
          root: 'mapboxgl',
          commonjs: './static/libs/mapboxgl/mapbox-gl-enhance.js',
          commonjs2: './static/libs/mapboxgl/mapbox-gl-enhance.js',
          amd: './static/libs/mapboxgl/mapbox-gl-enhance.js'
        });
      }
      if (/\/static\/libs\/deckgl\/deck.gl/.test(request)) {
        return callback(null, {
          root: 'DeckGL',
          commonjs: './static/libs/deckgl/deck.gl.min.js',
          commonjs2: './static/libs/deckgl/deck.gl.min.js',
          amd: './static/libs/deckgl/deck.gl.min.js'
        });
      }
      if (/\/static\/libs\/echarts-layer\/EchartsLayer/.test(request)) {
        return callback(null, {
          root: 'EchartsLayer',
          commonjs: './static/libs/echarts-layer/EchartsLayer.js',
          commonjs2: './static/libs/echarts-layer/EchartsLayer.js',
          amd: './static/libs/echarts-layer/EchartsLayer.js'
        });
      }
      // if (/\/static\/libs\/geostats\/geostats/.test(request)) {
      //   return callback(null, {
      //     root: "geostats",
      //     commonjs: "./static/libs/geostats/geostats.js",
      //     commonjs2: "./static/libs/geostats/geostats.js",
      //     amd: "./static/libs/geostats/geostats.js"
      //   });
      // }
      if (/\/static\/libs\/iclient-mapboxgl\/iclient9-mapboxgl/.test(request)) {
        return callback(null, {
          root: 'SuperMap',
          commonjs: './static/libs/iclient-mapboxgl/iclient9-mapboxgl.min.js',
          commonjs2: './static/libs/iclient-mapboxgl/iclient9-mapboxgl.min.js',
          amd: './static/libs/iclient-mapboxgl/iclient9-mapboxgl.min.js'
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
    Copyright© 2000 - 2019 SuperMap Software Co.Ltd
    license: ${pkg.license}
    version: v${pkg.version}
   `)
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
