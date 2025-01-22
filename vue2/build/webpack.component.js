const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const utils = require('./utils');

const type = utils.getMapLibName();
let entry;

if (process.argv.includes('--index')) {
  entry = { index: `vue-iclient/src/${type}/index.ts` };
}
const config = require('../config/externals');
const entrys = require(path.resolve(__dirname, `../src/${type}/entrys.json`));
const alias = {
  vue$: 'vue/dist/vue.esm.js',
  'vue-iclient': path.resolve(__dirname, '../'),
  'vue-iclient-static': path.resolve(__dirname, '../../static')
};

const webpackConfig = {
  mode: 'production',
  entry: entry || entrys,
  output: {
    path: path.resolve(process.cwd(), `./lib/${type}/`),
    publicPath: `lib/${type}/`,
    filename: chunk => outfilename(chunk),
    chunkFilename: '[id].js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.vue', '.json'],
    alias: alias,
    modules: [path.resolve(__dirname, '../node_modules'), 'node_modules']
  },
  externals: config.libExternals[type],
  performance: {
    hints: false
  },
  stats: 'errors-only',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
              appendTsSuffixTo: [/\.vue$/]
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        include: process.cwd(),
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 200000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [new ProgressBarPlugin(), new VueLoaderPlugin()]
};

function outfilename({ chunk }) {
  let name = chunk.name;
  if (name.includes('_utils/style')) {
    return '[name].js';
  }
  if (name.includes('/style')) {
    return '[name]/css.js';
  }
  if (name.includes('/') || name === 'index' || name === 'init') {
    return '[name].js';
  }
  return '[name]/index.js';
}
module.exports = webpackConfig;
