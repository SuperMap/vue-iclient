'use strict';
const fs = require('fs');
const path = require('path');
let argv = JSON.parse(process.env['npm_config_argv']);
let origin = argv.original;
const type = origin[2].substring(1);

let filePath = `../lib/${type}`;
try {
  fs.statSync(path.resolve(__dirname, filePath));
} catch (err) {
  filePath = `../lib`;
}
const compFiles = fs.readdirSync(path.resolve(__dirname, filePath));
compFiles.forEach(compName => {
  if (['index.js', 'init.js', 'style.js'].includes(compName) || compName.startsWith('_')) return;
  try {
    fs.statSync(path.resolve(__dirname, filePath) + `\\${compName}\\style`);
    fs.readFile(path.resolve(__dirname, filePath) + `\\${compName}\\style\\css.js`, 'utf8', function (err) {
      if (err) {
        throw new Error(`按需引入的lib包：没有${type}/lib/${compName}/style/css.js文件`);
      }
    });
  } catch (err) {
    throw new Error(`按需引入的lib包：${type}/lib/${compName}下没有style文件夹`);
  }
});
