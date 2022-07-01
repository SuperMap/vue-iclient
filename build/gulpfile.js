'use strict';
const transformLess = require('./transformLess');
const getBabelCommonConfig = require('../babel.config.js');

const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass')(require('sass'));
const cssimport = require('gulp-cssimport');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const through2 = require('through2');
const fileSave = require('file-save');
const fs = require('fs');
const path = require('path');

let argv = JSON.parse(process.env['npm_config_argv']);
let origin = argv.original;
let type = 'mapboxgl';
if (origin[2] && ['-mapboxgl', '-leaflet'].includes(origin[2])) {
  type = origin[2].replace('-', '');
}

const NO_STYLE_COMPONENTS = {
  mapboxgl: ['video-plus-draw', 'video-plus-layer', 'video-plus-marker', 'video-plus-popup'],
  leaflet: ['marker', 'popup']
};

const output_path = `../lib/${type}/`;
function compileSass(done) {
  let gulpFile = [
    '../src/common/[^_]**/style/!(mixin)**.scss',
    '../src/common/_utils**/style/**/*.scss',
    `../src/${type}/[^_]**/style/!(mixin)**.scss`,
    `../src/${type}/web-map/control/**/style/!(mixin)**.scss`,
    `../src/${type}/web-map/layer/**/style/!(mixin)**.scss`
  ];
  if (type === 'mapboxgl') {
    gulpFile.push(
      `../src/${type}/tdt*/!(^_)**/style/!(mixin)**.scss`,
      `../src/${type}/video-plus/control/**/style/!(mixin)**.scss`,
      `../src/${type}/video-plus/layer/**/style/!(mixin)**.scss`,
      `../src/${type}/video-plus/ui/marker/**/style/!(mixin)**.scss`,
      `../src/${type}/video-plus/ui/popup/**/style/!(mixin)**.scss`
    );
  }
  return gulp
    .src(gulpFile)
    .pipe(cssimport({}))
    .pipe(sass({ style: 'expanded' }))
    .pipe(cssnano())
    .pipe(autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9'))
    .pipe(
      through2.obj(function z(file, encoding, next) {
        const isTdt = file.path.match(/tdt/);
        const tdtResult = file.path.match(/tdt\\results/);
        console.log('1111111111111111path: ', file.path, ", isTdt: ", isTdt, ', tdtResult: ', tdtResult);
        if (isTdt) {
          const content = file.contents.toString(encoding);
          if (tdtResult) {
            file.path = file.path.replace(/tdt\\results\\style/, '_utils\\style\\tdt-results\\');
            file.contents = Buffer.from(content.replace(/tdt\/_assets/g, `../../../_assets`));
          } else {
            file.contents = Buffer.from(content.replace(/tdt\/_assets/g, `../../_assets`));
          }
          console.log('2222222222222222222222222istdtResult: true', tdtResult, ', tdtResult path: ', file.path);
        }
        this.push(file);
        next();
        done();
      })
    )
    .pipe(
      gulp.dest(file => {
        const layerType = file.path.match(/\\layer\\([a-zA-Z_\-0-9]+)\\/);
        const tdtType = file.path.match(/\\tdt\\([a-zA-Z_\-0-9]+)\\/);
        console.log('333333333333layerType: ', layerType, ',l ayerType: ', tdtType, ',path: ', file.path);
        if (layerType) {
          file.path = file.path.replace(`${layerType[1]}`, `${layerType[1]}-layer`);
        }
        if (tdtType) {
          file.path = file.path.replace(`\\tdt\\${tdtType[1]}`, `\\tdt-${tdtType[1]}`);
        }
        console.log('4444444444444 ', ',path: ', file.path);
        return output_path;
      })
    );
}
function compileLess(done) {
  gulp
    .src(['../src/common/[^_]**/style/*.less', '../src/common/_utils*/style/**/*.less'])
    .pipe(
      through2.obj(function (file, encoding, next) {
        if (file.path.match(/\.less$/)) {
          transformLess(file.path)
            .then(css => {
              file.contents = Buffer.from(css);
              file.path = file.path.replace(/\.less$/, '.css');
              this.push(file);
              next();
              done();
            })
            .catch(e => {
              console.error(e);
              done();
            });
        } else {
          next();
          done();
        }
      })
    )
    .pipe(gulp.dest(output_path));
}
function compileCssjs(done) {
  const babelConfig = getBabelCommonConfig();
  babelConfig.babelrc = false;
  delete babelConfig.cacheDirectory;
  let gulpFile = [
    `../src/${type}/style*.js`,
    '../src/common/[^_]**/style/index*.js',
    '../src/common/_utils*/style/**/index*.js',
    `../src/${type}/[^_]**/style/index*.js`,
    `../src/${type}/web-map/control/**/style/index*.js`,
    `../src/${type}/web-map/layer/**/style/index*.js`
  ];
  if (type === 'mapboxgl') {
    gulpFile.push(
      `../src/${type}/tdt*/!(^_|results)**/style/index*.js`,
      `../src/${type}/video-plus/control/**/style/index*.js`,
      `../src/${type}/video-plus/layer/**/style/index*.js`,
      `../src/${type}/video-plus/ui/marker/**/style/index*.js`,
      `../src/${type}/video-plus/ui/popup/**/style/index*.js`
    );
  }
  gulp
    .src(gulpFile)
    .pipe(babel(babelConfig))
    .pipe(
      through2.obj(function z(file, encoding, next) {
        const isIndexjs = file.path.match(/index\.(js|jsx|ts|tsx)$/);
        const isStylejs = file.path.match(/style\.js$/);
        if (isIndexjs || isStylejs) {
          const content = file.contents.toString(encoding);
          if (isStylejs) {
            file.contents = Buffer.from(
              content.replace(
                `vue-iclient\/src\/${type}\/css.js`,
                `@supermap/vue-iclient-${type}/dist/iclient-${type}-vue.min.css`
              )
            );
          }
          file = _cssjs(file, encoding);
        }
        if (isIndexjs) {
          this.push(file.clone());
          file.path = file.path.replace(/index\.(js|jsx|ts|tsx)$/, 'css.js');
        }
        this.push(file);
        next();
        done();
      })
    )
    .pipe(
      gulp.dest(file => {
        const layerType = file.path.match(/\\layer\\([a-zA-Z_\-0-9]+)\\/);
        const tdtType = file.path.match(/\\tdt\\([a-zA-Z_\-0-9]+)\\/);
        console.log('compileCssjs layerType: ', layerType, ',l ayerType: ', tdtType, ',path: ', file.path);
        if (layerType && !layerType[1].includes('-layer\\')) {
          file.path = file.path.replace(`${layerType[1]}`, `${layerType[1]}-layer`);
        }
        if (tdtType) {
          file.path = file.path.replace(`\\tdt\\${tdtType[1]}`, `\\tdt-${tdtType[1]}`);
        }
        console.log('compileCssjs ', ',path: ', file.path, !layerType[1].includes('-layer\\'));
        return output_path;
      })
    );
}
function _cssjs(file, encoding) {
  const content = file.contents.toString(encoding);
  file.contents = Buffer.from(
    content
      .replace(/\/style\/?'/g, "/style/css'")
      .replace(/\/style\/?"/g, '/style/css"')
      .replace(/(\.\.\/)+(.*)_utils\//g, './_utils')
      .replace(
        /vue-iclient\/src\/mapboxgl\/tdt\/results\/style/g,
        `@supermap/vue-iclient-${type}/lib/_utils/style/tdt-results`
      )
      .replace(/vue-iclient\/src\/mapboxgl/, `@supermap/vue-iclient-${type}/lib`)
      .replace(/vue-iclient\/src\/common\//g, `@supermap/vue-iclient-${type}/lib/`)
      .replace(/vue-iclient\/static\//g, `@supermap/vue-iclient-${type}/static/`)
      .replace(/\.less/g, '.css')
      .replace(/\.scss/g, '.css')
  );
  return file;
}
function compileCopy() {
  // 生成layer/style/index.js css.js
  createLayerStyle(`../src/${type}/web-map/layer/`);

  NO_STYLE_COMPONENTS[type].forEach(componentName => {
    createStyle(`../lib/${type}/${componentName}/style`);
  });
  // 全局配置组件没有style 生成config-provider/style/index.js css.js
  // []
  // 拷贝theme.json和_assets和tdt
  let gulpFile = ['../src/common/_utils*/style/**/*.json', '../src/common/_assets*/iconfont*/*'];
  type === 'mapboxgl' && gulpFile.push('../src/mapboxgl/tdt/_assets*/sprite*');
  return gulp.src(gulpFile).pipe(gulp.dest(output_path));
}
function createStyle(filePath) {
  fileSave(filePath + '/index.js').write('', 'utf8');
  fileSave(filePath + '/css.js').write('', 'utf8');
}

function createLayerStyle(filePath) {
  const compFiles = fs.readdirSync(path.resolve(__dirname, filePath));
  compFiles.forEach(compName => {
    if (compName === 'fill-extrusion') return;
    const outPath = `../lib/${type}/${compName}-layer/style`;
    try {
      fs.statSync(path.resolve(__dirname, filePath) + `\\${compName}\\style`);
    } catch (err) {
      createStyle(outPath);
    }
  });
}

exports.build = gulp.parallel(compileCopy, compileSass, compileLess, compileCssjs);
