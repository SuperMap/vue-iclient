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
      'vue-cesium': {
        root: 'VueCesium',
        commonjs: 'vue-cesium',
        commonjs2: 'vue-cesium',
        amd: 'vue-cesium'
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
      three: {
        root: 'THREE',
        commonjs: 'three',
        commonjs2: 'three',
        amd: 'three'
      },
      'video.js': {
        root: 'videojs',
        commonjs: 'video.js',
        commonjs2: 'video.js',
        amd: 'video.js'
      },
      'flv.js': {
        root: 'flvjs',
        commonjs: 'flv.js',
        commonjs2: 'flv.js',
        amd: 'flv.js'
      },
      'videojs-flash': {
        root: 'videojsFlash',
        commonjs: 'videojs-flash',
        commonjs2: 'videojs-flash',
        amd: 'videojs-flash'
      },
      'videojs-flvjs-es6': {
        root: 'videojsFlvjs',
        commonjs: 'videojs-flvjs-es6',
        commonjs2: 'videojs-flvjs-es6',
        amd: 'videojs-flvjs-es6'
      }
    },
    function(context, request, callback) {
      if (/three\/examples\/jsm\/loaders\/GLTFLoader/.test(request)) {
        return callback(null, {
          root: 'THREE.GLTFLoader',
          commonjs: 'three/examples/jsm/loaders/GLTFLoader',
          commonjs2: 'three/examples/jsm/loaders/GLTFLoader',
          amd: 'three/examples/jsm/loaders/GLTFLoader'
        });
      }
      if (/three\/examples\/jsm\/loaders\/OBJLoader2/.test(request)) {
        return callback(null, {
          root: 'THREE.OBJLoader2',
          commonjs: 'three/examples/jsm/loaders/OBJLoader2',
          commonjs2: 'three/examples/jsm/loaders/OBJLoader2',
          amd: 'three/examples/jsm/loaders/OBJLoader2'
        });
      }
      if (/\/static\/libs\/mapboxgl\/mapbox-gl-enhance/.test(request)) {
        return callback(null, {
          root: 'mapboxgl',
          commonjs: '../static/libs/mapboxgl/mapbox-gl-enhance.js',
          commonjs2: '../static/libs/mapboxgl/mapbox-gl-enhance.js',
          amd: '../static/libs/mapboxgl/mapbox-gl-enhance.js'
        });
      }
      if (/\/static\/libs\/deckgl\/deck.gl/.test(request)) {
        return callback(null, {
          root: 'DeckGL',
          commonjs: '../static/libs/deckgl/deck.gl.min.js',
          commonjs2: '../static/libs/deckgl/deck.gl.min.js',
          amd: '../static/libs/deckgl/deck.gl.min.js'
        });
      }
      if (/\/static\/libs\/echarts-layer\/EchartsLayer/.test(request)) {
        return callback(null, {
          root: 'EchartsLayer',
          commonjs: '../static/libs/echarts-layer/EchartsLayer.js',
          commonjs2: '../static/libs/echarts-layer/EchartsLayer.js',
          amd: '../static/libs/echarts-layer/EchartsLayer.js'
        });
      }
      if (/\/static\/libs\/iclient-mapboxgl\/iclient-mapboxgl/.test(request)) {
        return callback(null, {
          root: 'SuperMap',
          commonjs: '../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
          commonjs2: '../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
          amd: '../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js'
        });
      }
      if (/\/static\/libs\/mapbox-gl-draw\/mapbox-gl-draw/.test(request)) {
        return callback(null, {
          root: 'MapboxDraw',
          commonjs: '../static/libs/mapbox-gl-draw/mapbox-gl-draw.js',
          commonjs2: '../static/libs/mapbox-gl-draw/mapbox-gl-draw.js',
          amd: '../static/libs/mapbox-gl-draw/mapbox-gl-draw.js'
        });
      }
      callback();
    }
  ],
  optimization: {
    minimizer: []
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin({
      hashFunction: 'sha256',
      hashDigest: 'hex'
    }),
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
    Copyright© 2000 - 2021 SuperMap Software Co.Ltd
    license: ${pkg.license}
    version: v${pkg.version}
   `),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static/mbgl-index.js'),
        to: path.resolve(__dirname, '../dist/mapboxgl/index.js')
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
