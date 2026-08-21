'use strict';
const path = require('path');
const utils = require('./utils');
const config = require('../config');

const vueLoaderConfig = require('./vue-loader.conf');
const getOriginArgs = require('./get-origin-args');


function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
exports.nodeModulesParse = [
  'node_modules/vue-echarts',
  'node_modules/resize-detector',
  'node_modules/colorcolor',
  'node_modules/vue-videojs7',
  'node_modules/flv.js/src',
  'node_modules/videojs-flvjs-es6/src',
  'node_modules/geographic-coordinate-converter',
  'node_modules/swiper',
  'node_modules/dom7',
  // fast-xml-parser 5.10+ 及其运行时依赖发布的是未转译源码（含 ?? / ?.），
  // webpack 4 内置的 acorn 6 无法解析，必须交给 babel 处理
  'node_modules/fast-xml-parser',
  'node_modules/fast-xml-builder',
  'node_modules/path-expression-matcher',
  'node_modules/@nodable/entities',
  'node_modules/is-unsafe',
  'node_modules/strnum',
  'node_modules/xml-naming'
];
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
});

let origin = getOriginArgs();
let entry = './demo/mapboxgl/main.ts';

const engineArg = origin.find(arg => ['-mapboxgl', '-leaflet'].includes(arg));
if (engineArg) {
  let type = engineArg.replace('-', '');
  entry = `./demo/${type}/main.ts`;
}
module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: entry
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      'vue-iclient': path.resolve(__dirname, '../'),
      'swiper/modules': path.resolve(__dirname, '../node_modules/swiper/modules/index.mjs')
    }
  },
  module: {
    rules: [
      // ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/]
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }]
            ]
          }
        },
        include: [
          resolve('node_modules/swiper')
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          resolve('src'),
          resolve('test'),
          resolve('static/libs/json-sql'),
          ...nodeModulesParse.map(item => resolve(item))
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 200000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};
