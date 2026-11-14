'use strict';

module.exports = [
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
  'node_modules/xml-naming',
  'node_modules/@vue/compiler-sfc',
  'node_modules/vue-docgen-api',
  'node_modules/vue-docgen-api/node_modules/@vue/compiler-sfc'
];
