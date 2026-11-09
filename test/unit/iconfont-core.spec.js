const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const coreIconfont = '@supermapgis/iclient-components-core/static/assets/iconfont/icon-sm-components.css';
const oldIconfont = 'vue-iclient/src/common/_assets/iconfont/icon-sm-components.css';

function visit(directory, callback) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(filename, callback);
    else if (entry.name.endsWith('.js')) callback(filename);
  }
}

test('Vue2 样式入口和生成模板统一引用 core iconfont', () => {
  const sources = [];
  visit(path.join(root, 'src'), filename => sources.push(filename));
  sources.push(path.join(root, 'build/bin/build-install.js'));

  let importCount = 0;
  for (const filename of sources) {
    const content = fs.readFileSync(filename, 'utf8');
    assert.ok(!content.includes(oldIconfont), filename);
    if (content.includes(coreIconfont)) importCount++;
  }
  assert.ok(importCount > 0);

  const coreDirectory = path.join(root, 'node_modules/@supermapgis/iclient-components-core/static/assets/iconfont');
  for (const extension of ['css', 'ttf', 'woff', 'woff2']) {
    assert.ok(fs.existsSync(path.join(coreDirectory, `icon-sm-components.${extension}`)));
    assert.ok(!fs.existsSync(path.join(root, `src/common/_assets/iconfont/icon-sm-components.${extension}`)));
  }
});

test('独立发布的地图包声明 iconfont 所需的 core 依赖', () => {
  for (const type of ['leaflet', 'mapboxgl']) {
    const packageJson = require(path.join(root, `src/${type}/package.json`));
    const cssEntry = fs.readFileSync(path.join(root, `src/${type}/css.js`), 'utf8');
    assert.ok(cssEntry.includes(coreIconfont));
    assert.ok(packageJson.dependencies['@supermapgis/iclient-components-core']);
  }
});
