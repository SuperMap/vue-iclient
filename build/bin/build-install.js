'use strict';

const fs = require('fs');
const path = require('path');
var render = require('json-templater/string');
var uppercamelcase = require('uppercamelcase');
var endOfLine = require('os').EOL;
const fileSave = require('file-save');
let argv = JSON.parse(process.env['npm_config_argv']);
let origin = argv.original;
let type = 'mapboxgl';
if (origin[2] && ['-mapboxgl', '-leaflet'].includes(origin[2])) {
  type = origin[2].replace('-', '');
}
const commonFiles = [
  '../../src/common/_mixin',
  '../../src/common/web-map',
  `../../src/${type}/_mixin`,
  `../../src/${type}/web-map/_mixin`,
  '../../src/common/_lang',
  '../../src/common/_types',
  '../../src/common/_types/event',
  '../../src/common/_utils',
  '../../src/common/_utils/vue-types',
  '../../src/common/_utils/style/theme',
  '../../src/common/_utils/style/color',
  `../../src/${type}/_types`,
  `../../src/${type}/_utils`
];
let componentFiles = [
  '../../src/common', // 排除web-map,_文件夹
  `../../src/${type}`, // 排除web-map,_, tdt文件夹，文件
  `../../src/${type}/web-map/layer`,
  `../../src/${type}/web-map/control`
];
if (type === 'mapboxgl') {
  //leaflet没有tdt文件
  componentFiles.push(`../../src/${type}/tdt`);
}
var MAIN_TEMPLATE = `
{
  "index": "vue-iclient/src/${type}/index.ts",
  "init": "vue-iclient/src/init.js",
{{componentList}}
{{commonList}}
}`;

var INSTALL_TEMPLATE = `{{importComList}}
import init from 'vue-iclient/src/init';

{{component}}.install = function(Vue, opts) {
  init(Vue, opts);
{{registerComList}}
};

export default {{component}};
`;
var MESSAGE_INSTALL_TEMPLATE = `{{importComList}}
import init from 'vue-iclient/src/init';

{{component}}.install = function(Vue, opts) {
  init(Vue, opts);
{{registerMessage}}
{{registerComList}}
};

export default {{component}};
`;
// import Base from 'ant-design-vue/es/base';
var ANTD_INSTALL_TEMPLATE = `{{importComList}}
import init from 'vue-iclient/src/init';

{{component}}.install = function(Vue, opts) {
  init(Vue, opts);
{{registerComList}}
};

export default {{component}};
`;

var SPECIAL_INSTALL_TEMPLATE = `import {{component}} from './{{component}}.js';

export default {{component}};
`;

var INDEX_LESS_TEMPLATE = `@import 'ant-design-vue/es/{{component}}/style/index.less';
@import 'ant-design-vue/es/style/index.less';
@import '../../_utils/style/theme/antdVar.less';
`;

var ANTD_CSS_JS_TEMPLATE = `import 'vue-iclient/src/common/_assets/iconfont/icon-sm-components.css';
import 'vue-iclient/src/common/_utils/style/common/common.scss';
import './index.less';
import './{{component}}.scss';
`;

var COMP_CSS_JS_TEMPLATE = `import 'vue-iclient/src/common/_assets/iconfont/icon-sm-components.css';
import 'vue-iclient/src/common/_utils/style/common/common.scss';
{{antdLessList}}
{{cardCss}}{{mapCss}}
{{tdtResultScss}}
import './{{component}}.scss';
`;

var SPECIAL_INSTALL_COM = ['message', 'notification'];

var COMPONENT_JS_TEMPLATE = `/** common */
{{commonList}}

/** layer */
{{layerList}}

/** control */
{{controlList}}

{{tdtList}}

{{otherList}}

{{components}}
`;

const allCompPath = _getAllCompPath();
const antdComPath = _getAntdPath();
createInstallTemplate();
createComponentJson();
createIndexLess();
createCssJs();
createComponentJS();

// 生成install的index.js
function createInstallTemplate() {
  const compNames = Object.keys(allCompPath);
  const andCompNames = Object.keys(antdComPath).map(item => uppercamelcase(item));
  compNames.forEach(compName => {
    const item = allCompPath[compName] || {};
    const { subComps, filePath } = item;
    let registerMessageFlag = false;
    let registerComList = [];
    let importComList = [];
    let template;

    // 同文件下的所有组件
    subComps.forEach(subComName => {
      const newCompName = subComName === 'Number' ? 'InputNumber' : subComName;
      const newCompPath = subComName + '.vue';
      // 给用到$message的组件，注册message
      if (!SPECIAL_INSTALL_COM.includes(newCompName)) {
        const data = fs.readFileSync(path.resolve(__dirname, filePath) + '\\' + newCompPath, 'utf-8');
        // 文件中包含map-getter.ts和this.$message都要注册
        registerMessageFlag = data.includes('/map-getter') || data.includes('this.$message');
      }
      // Modal和Spin引入的是main.ts, 其他组件引入.vue
      if (newCompName === 'Modal' || newCompName === 'Spin') {
        importComList.push(`import { default as ${newCompName} } from './main.ts';`);
      } else {
        importComList.push(`import ${newCompName} from './${newCompPath}';`);
      }
      // .options ? ${newCompName}.options.name : ${newCompName}
      registerComList.push(
        `  Vue.component(${newCompName}.options ? ${newCompName}.options.name : ${newCompName}.name, ${newCompName});`
      );
    });
    // message, notifacation注册
    if (SPECIAL_INSTALL_COM.includes(compName)) {
      template = render(SPECIAL_INSTALL_TEMPLATE, {
        component: uppercamelcase(compName)
      });
    } else {
      let registerMessage = [];
      if (registerMessageFlag) {
        importComList.push(`import Message from 'vue-iclient/src/common/message/index.js';`);
        registerMessage.push(`  Vue.prototype.$message = Message;`);
      }
      const renderTemplate = registerMessageFlag ? MESSAGE_INSTALL_TEMPLATE : INSTALL_TEMPLATE;
      template = render(andCompNames.includes(compName) ? ANTD_INSTALL_TEMPLATE : renderTemplate, {
        component: compName,
        registerMessage: registerMessage.join(endOfLine),
        registerComList: registerComList.join(endOfLine),
        importComList: importComList.join(endOfLine)
      });
    }
    const outpath = path.join(__dirname, filePath + '/index.js');
    template && fileSave(outpath).write(template, 'utf8');
  });
}

// antd组件生成index.less
function createIndexLess() {
  const antdPath = _getAntdPath();
  for (let item in antdPath) {
    const filePath = antdPath[item];
    const outpath = path.join(__dirname, filePath + '/style/index.less');
    const template = render(INDEX_LESS_TEMPLATE, {
      component: item
    });
    template && fileSave(outpath).write(template, 'utf8');
  }
}

// 生成所有组件style/index.js
function createCssJs() {
  for (let name in allCompPath) {
    const { filePath, folderName: item, subComps } = allCompPath[name];
    if (
      !(filePath.includes('/common') && item === 'web-map') &&
      !(filePath.includes(`/${type}`) && ['marker', 'chart', 'popup'].includes(item))
    ) {
      const outpath = path.join(__dirname, filePath + '/style/index.js');
      if (filePath.includes('/layer/') && !filePath.includes('animate-marker')) {
        continue;
      }
      const compFiles = fs.readdirSync(path.resolve(__dirname, filePath + '/style'));
      let antdLessList = [];
      let mapCss = [];
      let cardFlag = false;
      let cardCss = [];
      let tdtResultScss = [];
      // antd组件的样式
      if (!filePath.includes('/layer/')) {
        const scssName = filePath.includes('/tdt/') ? 'tdt-' + item : item;
        const sassFileData = fs.readFileSync(path.resolve(__dirname, filePath + `/style/${scssName}.scss`), 'utf-8');
        antdLessList = _getImportAntdComCss(sassFileData);
      }
      // tdt的results样式
      if (filePath.includes('/tdt/')) {
        const fileData = fs.readFileSync(path.resolve(__dirname, filePath + `/${name}.vue`), 'utf-8');
        const reg = new RegExp(/\.\/results\/([a-zA-Z_\-0-9]+)/, 'g');
        while (reg.test(fileData)) {
          let filename = RegExp.$1;
          filename = filename[0].toLowerCase() + filename.slice(1);
          tdtResultScss.push(`import 'vue-iclient/src/${type}/tdt/results/style/${filename}.scss';`);
        }
      }
      // card样式
      if (!SPECIAL_INSTALL_COM.includes(item)) {
        subComps.forEach(item => {
          const fileData = fs.readFileSync(path.resolve(__dirname, filePath + `/${item}.vue`), 'utf-8');
          if (fileData.includes('_mixin/Card')) {
            cardFlag = true;
          }
        });
        if (cardFlag) {
          cardCss.push(`import 'vue-iclient/src/common/collapse-card/style/collapse-card.scss';`);
        }
      }
      // 引入static下面的css文件
      if (item === 'web-map') {
        mapCss =
          type === 'mapboxgl'
            ? [
                `import 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance.css';`,
                `import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min.css';`
              ]
            : [`import 'leaflet/dist/leaflet.css';`, `import 'vue-iclient/static/libs/iclient-leaflet/iclient-leaflet.min.css';`];
      }
      // 有index.less都要引入index.less
      const renderTemplate = compFiles.includes('index.less') ? ANTD_CSS_JS_TEMPLATE : COMP_CSS_JS_TEMPLATE;
      const component = filePath.includes('tdt/') ? 'tdt-' + item : item;
      const template = render(renderTemplate, {
        component: filePath.includes('/web-map/layer') ? component + '-layer' : component,
        antdLessList: antdLessList.join(endOfLine),
        cardCss: cardCss.join(endOfLine),
        mapCss: mapCss.join(endOfLine),
        tdtResultScss: tdtResultScss.join(endOfLine)
      });
      template && fileSave(outpath).write(template, 'utf8');
    }
  }
}

// 生成entrys.json(按需打包入口文件)，不包含ts文件
function createComponentJson() {
  const output_path = path.join(__dirname, `../../src/${type}/entrys.json`);
  // const mixin_output_path = path.join(__dirname, `../../src/${type}/mixins.json`);
  // var mixinList = [];

  var commonList = [];
  var componentList = [];
  var template;
  // 所有js 和 ts 入口文件。ts存放在mixins.json中
  commonFiles.forEach(filePath => {
    const fileName = filePath
      .replace(`../../src/common/web-map`, '_mixin')
      .replace('../../src/common/', '')
      .replace(`../../src/${type}/web-map/`, '')
      .replace(`../../src/${type}/`, '');
    const realPath = filePath.replace('../../', 'vue-iclient/');
    const readDir = fs.readdirSync(path.resolve(__dirname, filePath));
    readDir.forEach(comp => {
      if ((!comp.includes('.json') && comp.includes('.js')) || comp.includes('.ts')) {
        const compName = comp.replace(/\.(j|t)s/, '');
        commonList.push(` "${fileName}/${compName}" : "${realPath}/${comp}"`);
      }
      // if (comp.includes('.ts')) {
      //   const compName = comp.replace(/\.ts/, '');
      //   mixinList.push(`  "${fileName}/${compName}" : "${realPath}/${comp}"`);
      // }
    });
  });
  // 构造组件的入口文件
  for (let name in allCompPath) {
    if (name === 'ChartMixin') {
      continue;
    }
    let { folderName, filePath } = allCompPath[name];
    filePath = filePath.replace('../../', 'vue-iclient/');
    folderName = filePath.includes('/tdt/') ? 'tdt-' + folderName : folderName;
    if (filePath.includes('/layer/') && !folderName.includes('layer')) {
      folderName = folderName + '-layer';
    }
    componentList.push(`  "${folderName}": "${filePath}/index.js",`);
  }
  // entrys.json
  template = render(MAIN_TEMPLATE, {
    commonList: commonList.join(',' + endOfLine),
    componentList: componentList.join(endOfLine)
  });
  fs.writeFileSync(output_path, template);
  // // 生成mixins.json
  // template = render(MAIN_TEMPLATE, {
  //   commonList: mixinList.join(',' + endOfLine),
  //   componentList: [].join(endOfLine)
  // });
  // fs.writeFileSync(mixin_output_path, template);
}

// 生成各端下面的components.js
function createComponentJS() {
  const compNames = Object.keys(allCompPath).filter(item => item !== 'ChartMixin');
  var commonList = [],
    layerList = [],
    controlList = [],
    otherList = [],
    tdtList = [],
    components = [];
  compNames.forEach(compName => {
    const { filePath } = allCompPath[compName] || {};
    const temp = `import { default as ${uppercamelcase(compName)} } from '${filePath.replace(
      '../../src',
      'vue-iclient/src'
    )}/index.js';`;
    if (filePath.includes('/common')) {
      commonList.push(temp);
    } else if (filePath.includes('/layer/')) {
      layerList.push(temp);
    } else if (filePath.includes('/control/')) {
      controlList.push(temp);
    } else if (filePath.includes('/tdt/')) {
      tdtList.push(temp);
    } else {
      otherList.push(temp);
    }

    components.push(uppercamelcase(compName));
  });
  const outpath = path.resolve(__dirname, `../../src/${type}/components.js`);

  const template = render(COMPONENT_JS_TEMPLATE, {
    commonList: commonList.join(endOfLine),
    layerList: layerList.join(endOfLine),
    controlList: controlList.join(endOfLine),
    tdtList: tdtList.join(endOfLine),
    otherList: otherList.join(endOfLine),
    components: `export const components = {${components}}`
  });
  template && fileSave(outpath).write(template, 'utf8');
}

// 获取对接的antd组件的路径
function _getAntdPath() {
  const filePath = '../../src/common';
  const files = fs.readdirSync(path.resolve(__dirname, filePath));
  let antdPath = {};
  files.forEach(function (item, index) {
    let stat = fs.statSync(path.resolve(__dirname, filePath) + '/' + item);
    // common下面的antd组件 vue文件或者同名的js文件（如message），或者是包含ant-design-vue/es
    if (
      item !== 'slideshow' &&
      item !== 'web-map' &&
      item !== 'chart' &&
      !item.match('^_') &&
      stat.isDirectory() === true
    ) {
      try {
        const suffix = SPECIAL_INSTALL_COM.includes(item) ? '.js' : '.vue';
        const data = fs.readFileSync(
          path.resolve(__dirname, filePath) + '\\' + item + '\\' + uppercamelcase(item) + suffix,
          'utf-8'
        );
        if (data.includes('AntdRender') || data.includes(`ant-design-vue/es/${item}`)) {
          antdPath[item] = filePath + '/' + item;
        }
      } catch (err) {
        console.error(err);
      }
    }
  });
  return antdPath;
}

// 获取所有组件的路径
function _getAllCompPath() {
  let allCompPath = {};
  componentFiles.forEach(filePath => {
    const files = fs.readdirSync(path.resolve(__dirname, filePath));
    files.forEach(function (item, index) {
      let stat = fs.statSync(path.resolve(__dirname, filePath) + '/' + item);
      let component;
      // tdt/results文件夹， _开头文件夹
      if (item !== 'tdt' && item !== 'results' && !item.match('^_') && stat.isDirectory() === true) {
        const compFiles = fs.readdirSync(path.resolve(__dirname, filePath + '/' + item));
        const subComps = [];
        compFiles.forEach(compName => {
          if (compName.includes('.vue') && compName !== 'BaseMixin.vue') {
            const newCompName = compName.replace('.vue', '');
            subComps.push(newCompName);
            if (
              newCompName === 'ChartMixin' ||
              newCompName.toUpperCase() === uppercamelcase(item).toUpperCase() ||
              newCompName.replace('Layer', '').toUpperCase() === uppercamelcase(item).toUpperCase() ||
              newCompName.toUpperCase() === uppercamelcase('tdt-' + item).toUpperCase()
            ) {
              component = newCompName;
            }
          }
        });
        if (component) {
          allCompPath[component] = { filePath: filePath + '/' + item, folderName: item, subComps };
        }
        if (SPECIAL_INSTALL_COM.includes(item)) {
          allCompPath[item] = { filePath: filePath + '/' + item, folderName: item, subComps: [item] };
        }
      }
    });
  });
  return allCompPath;
}

// 组件调用，获取所有要引入“组件style/index.js”的组件
function _getImportAntdComCss(sassFileData) {
  const antdFolderNames = Object.keys(antdComPath);
  let result = [];
  antdFolderNames.forEach(name => {
    const importScss = `/style/${name}.scss`;
    const lessPath = antdComPath[name].replace('../../src', 'vue-iclient/src');
    if (sassFileData.includes(importScss)) {
      result.push(`import '${lessPath}/style/index.js';`);
    }
  });
  return result;
}


