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

const matchMapLibName = ['mapboxgl', 'leaflet'].find(name => process.argv.includes(`--${name}`));
const type = matchMapLibName || 'mapboxgl';

const NO_STYLE_COMPONENTS = {
  mapboxgl: ['video-plus-layer', 'video-plus-marker', 'video-plus-popup'],
  leaflet: ['marker', 'popup']
};

const output_path = `../lib/${type}/`;
function compileSass(done) {
  let gulpFile = [
    '../src/common/[^_]**/style/!(mixin)**.scss',
    '../src/common/_utils**/style/**/*.scss',
    `../src/${type}/[^_]**/style/!(mixin)**.scss`,
    `../src/${type}/**/control/**/style/!(mixin)**.scss`,
    `../src/${type}/**/layer/**/style/!(mixin)**.scss`
  ];
  if (type === 'mapboxgl') {
    gulpFile.push(
      `../src/${type}/tdt*/!(^_)**/style/!(mixin)**.scss`,
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
        const tdtResult = file.path.match(/tdt[\/\\]results/);
        const sep = file.path.match(/[\/\\]/)[0];
        if (isTdt) {
          const content = file.contents.toString(encoding);
          if (tdtResult) {
            file.path = file.path.replace(/tdt[\/\\]results[\/\\]style/, `_utils${sep}style${sep}tdt-results${sep}/`);
            file.contents = Buffer.from(content.replace(/tdt\/_assets/g, `../../../_assets`));
          } else {
            file.contents = Buffer.from(content.replace(/tdt\/_assets/g, `../../_assets`));
          }
        }
        this.push(file);
        next();
        done();
      })
    )
    .pipe(
      gulp.dest(file => {
        const layerType = file.path.match(/[\/\\]web-map[\/\\]layer[\/\\]([a-zA-Z_\-0-9]+)[\/\\]/);
        const controlType = file.path.match(/[\/\\]web-map[\/\\]control[\/\\]([a-zA-Z_\-0-9]+)[\/\\]/);
        const tdtType = file.path.match(/[\/\\]tdt([\/\\])[a-zA-Z_\-0-9]+[\/\\]/);
        const isVideoPlusControl = file.path.match(/[\/\\]video-plus[\/\\]control[\/\\]([a-zA-Z_\-0-9]+)[\/\\]/);
        const sep = file.path.match(/[\/\\]/)[0];

        if (layerType) {
          file.path = file.path.replace(`${layerType[0]}`, `${sep}${layerType[1]}-layer${sep}`);
        }
        if (controlType) {
          file.path = file.path.replace(`${controlType[0]}`, `${sep}${controlType[1]}${sep}`);
        }
        if (tdtType) {
          const len = tdtType[1].length;
          const index = tdtType['index'] + len + 3;
          file.path = file.path.slice(0, index) + '-' + file.path.slice(index + len);
        }
        if (isVideoPlusControl) {
          file.path = file.path.replace(/[\/\\]control[\/\\]/, `-`);
        }
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
    `../src/${type}/**/control/**/style/index*.js`,
    `../src/${type}/**/layer/**/style/index*.js`
  ];
  if (type === 'mapboxgl') {
    gulpFile.push(
      `../src/${type}/tdt*/!(^_|results)**/style/index*.js`,
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
                `@supermapgis/vue-iclient-${type}/dist/iclient-${type}-vue.min.css`
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
        const layerType = file.path.match(/[\/\\]web-map[\/\\]layer[\/\\]([a-zA-Z_\-0-9]+)[\/\\]/);
        const controlType = file.path.match(/[\/\\]web-map[\/\\]control[\/\\]([a-zA-Z_\-0-9]+)[\/\\]/);

        const tdtType = file.path.match(/[\/\\]tdt([\/\\])[a-zA-Z_\-0-9]+[\/\\]/);
        const isVideoPlusControl = file.path.match(/[\/\\]video-plus[\/\\]control[\/\\]([a-zA-Z_\-0-9]+)[\/\\]/);
        const sep = file.path.match(/[\/\\]/)[0];

        if (layerType && !layerType[1].match(/-layer[\/\\]/)) {
          file.path = file.path.replace(`${layerType[0]}`, `${sep}${layerType[1]}-layer${sep}`);
        }
        if (controlType) {
          file.path = file.path.replace(`${controlType[0]}`, `${sep}${controlType[1]}${sep}`);
        }
        if (tdtType) {
          const len = tdtType[1].length;
          const index = tdtType['index'] + len + 3;
          file.path = file.path.slice(0, index) + '-' + file.path.slice(index + len);
        }
        if (isVideoPlusControl) {
          file.path = file.path.replace(/[\/\\]control[\/\\]/, `-`);
        }
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
        `@supermapgis/vue-iclient-${type}/lib/_utils/style/tdt-results`
      )
      .replace(/vue-iclient\/src\/mapboxgl/, `@supermapgis/vue-iclient-${type}/lib`)
      .replace(/vue-iclient\/src\/common\//g, `@supermapgis/vue-iclient-${type}/lib/`)
      .replace(/vue-iclient\/static\//g, `@supermapgis/vue-iclient-${type}/static/`)
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
      fs.statSync(path.resolve(__dirname, filePath, `${compName}/style`));
    } catch (err) {
      createStyle(outPath);
    }
  });
}

exports.build = gulp.parallel(compileCopy, compileSass, compileLess, compileCssjs);
