'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const outputFileName = 'iclient9-mapboxgl-widgets-vue'
const env = process.env.NODE_ENV === 'testing' ?
  require('../config/test.env') :
  require('../config/prod.env')
const isMinify = process.argv.includes('-p');
const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders({
      //sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  //devtool: config.build.productionSourceMap ? config.build.devtool : false,
  entry: {
    app: ['./src/index.js']
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: isMinify ? `${outputFileName}.min.js` : `${outputFileName}.js`,
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: ['SuperMap', 'Widgets'],
  },
  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue'
    },
    'echarts': 'echarts',
    '@libs/mapboxgl/mapbox-gl-enhance': {
      root: 'mapboxgl',
      commonjs: './libs/mapboxgl/mapbox-gl-enhance.js',
      commonjs2: './libs/mapboxgl/mapbox-gl-enhance.js',
      amd: './libs/mapboxgl/mapbox-gl-enhance.js'
    },
    '@libs/iclient-mapboxgl/iclient9-mapboxgl.min': {
      root: 'SuperMap',
      commonjs: './libs/iclient-mapboxgl/iclient9-mapboxgl.min',
      commonjs2: './libs/iclient-mapboxgl/iclient9-mapboxgl.min',
      amd: './libs/iclient-mapboxgl/iclient9-mapboxgl.min'
    },
    "@mapbox/mapbox-gl-draw": {
      root: 'MapboxDraw',
      commonjs: '@mapbox/mapbox-gl-draw',
      commonjs2: '@mapbox/mapbox-gl-draw',
      amd: '@mapbox/mapbox-gl-draw'
    },
    "echarts-liquidfill": "echarts-liquidfill"
  },
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
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../libs'),
        to: path.resolve(__dirname, '../dist/libs'),
        ignore: ['.*']
      }
    ]),
  ]
})

if (isMinify) {
  webpackConfig.optimization.minimizer.push(new OptimizeCSSAssetsPlugin({}), new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: config.build.productionSourceMap,
    uglifyOptions: {
      warnings: false
    }
  }))
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
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
