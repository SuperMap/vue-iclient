'use strict';
const fs = require('fs');
const path = require('path');
let argv = JSON.parse(process.env['npm_config_argv']);
let origin = argv.original;
const type = origin[2].substring(1);

const filePath = `../lib/${type}`;
const compFiles = fs.readdirSync(path.resolve(__dirname, filePath));
compFiles.forEach(compName => {
  if (['index.js', 'init.js', 'style.js'].includes(compName) || compName.startsWith('_')) return;
  const stylePath = path.resolve(__dirname, filePath, `${compName}/style`);
  const styleJsPath = path.resolve(__dirname, filePath, `${compName}/style/css.js`);
  try {
    fs.statSync(stylePath);
    fs.readFile(styleJsPath , 'utf8', function (err) {
      if (err) {
        throw new Error(`按需引入的lib包：${styleJsPath}不存在`);
      }
    });
  } catch (err) {
    throw new Error(`按需引入的lib包：${stylePath}不存在`);
  }
});
