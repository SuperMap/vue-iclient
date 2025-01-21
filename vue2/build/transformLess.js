/*!
 *
 * ant-design-vue
 *
 * Copyright 2017-present, ant-design-vue.
 * All rights reserved.
 *
 */
const less = require('less');
const { readFileSync } = require('fs');
const path = require('path');
const postcss = require('postcss');
const NpmImportPlugin = require('less-plugin-npm-import');
const rucksack = require('rucksack-css');
const autoprefixer = require('autoprefixer');

function transformLess(lessFile, config = {}) {
  const { cwd = process.cwd() } = config;
  const resolvedLessFile = path.resolve(cwd, lessFile);

  let data = readFileSync(resolvedLessFile, 'utf-8');
  data = data.replace(/^\uFEFF/, '');

  const lessOpts = {
    paths: [path.dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    plugins: [new NpmImportPlugin({ prefix: '~' })],
    javascriptEnabled: true
  };
  return less
    .render(data, lessOpts)
    .then(result => {
      const source = result.css;
      return postcss([rucksack(), autoprefixer()]).process(source, { from: undefined });
    })
    .then(r => {
      return r.css;
    });
}

module.exports = transformLess;
