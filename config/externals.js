const nodeExternals = require('webpack-node-externals');
const uppercamelcase = require('uppercamelcase');

let argv = JSON.parse(process.env['npm_config_argv']);
let origin = argv.original;
let type = 'mapboxgl';
if (origin[2] && ['-mapboxgl', '-leaflet'].includes(origin[2])) {
  type = origin[2].replace('-', '');
}

const commonFiles = require(`../src/${type}/entrys.json`);
const allFiels = Object.assign({}, commonFiles);

// 单文件打包需要external
var externals = {};
// index.ts打包external所有引入的文件, 包括install.js和导出的js
var installExternals = {
  'vue-iclient/src/common/_utils/style/theme/set-theme': `@supermap/vue-iclient-${type}/lib/_utils/style/theme/set-theme`,
  'vue-iclient/src/common/_lang/index': `@supermap/vue-iclient-${type}/lib/_lang/index.js`,
  'vue-iclient/src/common/_utils/epsg-define': `@supermap/vue-iclient-${type}/lib/_utils/epsg-define.js`,
  [`vue-iclient/src/${type}/_types/index`]: `@supermap/vue-iclient-${type}/lib/_types/index.js`,
  [`vue-iclient/src/${type}/_utils/index`]: `@supermap/vue-iclient-${type}/lib/_utils/index.js`,
  [`vue-iclient/src/${type}/style`]: `@supermap/vue-iclient-${type}/lib/style.js`
};

for (let key in allFiels) {
  let filePath = allFiels[key];
  if (key.includes('/')) {
    const oldFilePath = filePath.replace(/\.(j|t)s/, '');
    const newFilePath = filePath
      .replace('vue-iclient/', `@supermap/vue-iclient-${type}/`)
      .replace('src/common/web-map', `lib/_mixin`)
      .replace('src/common', 'lib')
      .replace(`src/${type}`, 'lib')
      .replace('web-map/_mixin/', `_mixin/`)
      .replace(/\.(j|t)s/, '.js');
    externals[`${oldFilePath}`] = `${newFilePath}`;
  } else if (key !== 'index' && (filePath.includes('vue-iclient/src/common/') || filePath.includes(`vue-iclient/src/${type}/`))) {
    // 组件引用
    let newFilePath = filePath
      .replace(/vue-iclient\/src\/(common|mapboxgl|leaflet)/, `@supermap/vue-iclient-${type}/lib`)
      .replace('/index.js', '');
    const suffix = ['message', 'notification'].includes(key) ? '.js' : '.vue';
    const oldFilePath = filePath.replace(`index.js`, `${uppercamelcase(key)}${suffix}`);
    if (newFilePath.includes('/layer/')) {
      newFilePath += '-layer';
    }
    newFilePath = newFilePath.replace('web-map/layer/', '').replace('web-map/control/', '').replace('tdt/', 'tdt-');
    externals[`${oldFilePath}`] = `${newFilePath}`;

    if (origin.includes('-index')) {
      installExternals[`${filePath}`] = `${newFilePath}`;
    }
  }
}

var commonExternals = {
  vue: {
    root: 'Vue',
    commonjs: 'vue',
    commonjs2: 'vue',
    amd: 'vue'
  },
  echarts: 'echarts',
  'vue-echarts': {
    root: 'VueECharts',
    commonjs: 'vue-echarts',
    commonjs2: 'vue-echarts',
    amd: 'vue-echarts'
  },
  'echarts-liquidfill': 'echarts-liquidfill',
  'video.js': {
    root: 'videojs',
    commonjs: 'video.js',
    commonjs2: 'video.js',
    amd: 'video.js'
  },
  'flv.js': {
    root: 'flvjs',
    commonjs: 'flv.js',
    commonjs2: 'flv.js',
    amd: 'flv.js'
  },
  'videojs-flash': {
    root: 'videojsFlash',
    commonjs: 'videojs-flash',
    commonjs2: 'videojs-flash',
    amd: 'videojs-flash'
  },
  'videojs-flvjs-es6': {
    root: 'videojsFlvjs',
    commonjs: 'videojs-flvjs-es6',
    commonjs2: 'videojs-flvjs-es6',
    amd: 'videojs-flvjs-es6'
  }
};
const leafletExternals = Object.assign(
  {
    leaflet: {
      root: 'L',
      commonjs: 'leaflet',
      commonjs2: 'leaflet',
      amd: 'leaflet'
    }
  },
  commonExternals
);
const mapboxglExteranls = Object.assign(
  {
    mapv: 'mapv',
    'vue-cesium': {
      root: 'VueCesium',
      commonjs: 'vue-cesium',
      commonjs2: 'vue-cesium',
      amd: 'vue-cesium'
    },
    shapefile: 'shapefile',
    three: {
      root: 'THREE',
      commonjs: 'three',
      commonjs2: 'three',
      amd: 'three'
    },
    'wwobjloader2': 'wwobjloader2',
    xlsx: {
      root: 'XLSX',
      commonjs: 'xlsx',
      commonjs2: 'xlsx',
      amd: 'xlsx'
    }
  },
  commonExternals
);

const leafletExternalsFun = function (context, request, callback) {
  if (/\/static\/libs\/deckgl\/deck.gl/.test(request)) {
    return callback(null, {
      root: 'DeckGL',
      commonjs: '@supermap/vue-iclient-leaflet/static/libs/deckgl/deck.gl.min.js',
      commonjs2: '@supermap/vue-iclient-leaflet/static/libs/deckgl/deck.gl.min.js',
      amd: '@supermap/vue-iclient-leaflet/static/libs/deckgl/deck.gl.min.js'
    });
  }
  if (/\/static\/libs\/iclient-leaflet\/iclient-leaflet/.test(request)) {
    return callback(null, {
      root: 'SuperMap',
      commonjs: '@supermap/vue-iclient-leaflet/static/libs/iclient-leaflet/iclient-leaflet.min.js',
      commonjs2: '@supermap/vue-iclient-leaflet/static/libs/iclient-leaflet/iclient-leaflet.min.js',
      amd: '@supermap/vue-iclient-leaflet/static/libs/iclient-leaflet/iclient-leaflet.min.js'
    });
  }
  callback();
};

const mapboxglExteranlsFun = function (context, request, callback) {
  if (/three\/examples\/jsm\/loaders\/GLTFLoader/.test(request)) {
    return callback(null, {
      root: 'THREE',
      commonjs: 'three/examples/jsm/loaders/GLTFLoader',
      commonjs2: 'three/examples/jsm/loaders/GLTFLoader',
      amd: 'three/examples/jsm/loaders/GLTFLoader'
    });
  }
  if (/\/static\/libs\/mapboxgl\/mapbox-gl-enhance/.test(request)) {
    return callback(null, {
      root: 'mapboxgl',
      commonjs: '@supermap/vue-iclient-mapboxgl/static/libs/mapboxgl/mapbox-gl-enhance.js',
      commonjs2: '@supermap/vue-iclient-mapboxgl/static/libs/mapboxgl/mapbox-gl-enhance.js',
      amd: '@supermap/vue-iclient-mapboxgl/static/libs/mapboxgl/mapbox-gl-enhance.js'
    });
  }
  if (/\/static\/libs\/deckgl\/deck.gl/.test(request)) {
    return callback(null, {
      root: 'DeckGL',
      commonjs: '@supermap/vue-iclient-mapboxgl/static/libs/deckgl/deck.gl.min.js',
      commonjs2: '@supermap/vue-iclient-mapboxgl/static/libs/deckgl/deck.gl.min.js',
      amd: '@supermap/vue-iclient-mapboxgl/static/libs/deckgl/deck.gl.min.js'
    });
  }
  if (/\/static\/libs\/echarts-layer\/EchartsLayer/.test(request)) {
    return callback(null, {
      root: 'EchartsLayer',
      commonjs: '@supermap/vue-iclient-mapboxgl/static/libs/echarts-layer/EchartsLayer.js',
      commonjs2: '@supermap/vue-iclient-mapboxgl/static/libs/echarts-layer/EchartsLayer.js',
      amd: '@supermap/vue-iclient-mapboxgl/static/libs/echarts-layer/EchartsLayer.js'
    });
  }
  if (/\/static\/libs\/iclient-mapboxgl\/iclient-mapboxgl/.test(request)) {
    return callback(null, {
      root: 'SuperMap',
      commonjs: '@supermap/vue-iclient-mapboxgl/static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
      commonjs2: '@supermap/vue-iclient-mapboxgl/static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
      amd: '@supermap/vue-iclient-mapboxgl/static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js'
    });
  }
  if (/\/static\/libs\/mapbox-gl-draw\/mapbox-gl-draw/.test(request)) {
    return callback(null, {
      root: 'MapboxDraw',
      commonjs: '@supermap/vue-iclient-mapboxgl/static/libs/mapbox-gl-draw/mapbox-gl-draw.js',
      commonjs2: '@supermap/vue-iclient-mapboxgl/static/libs/mapbox-gl-draw/mapbox-gl-draw.js',
      amd: '@supermap/vue-iclient-mapboxgl/static/libs/mapbox-gl-draw/mapbox-gl-draw.js'
    });
  }
  callback();
};

const libExtral = {
  'vue-iclient/static/libs/geostats/geostats': `@supermap/vue-iclient-${type}/static/libs/geostats/geostats`,
  'vue-iclient/static/libs/json-sql/jsonsql': `@supermap/vue-iclient-${type}/static/libs/json-sql/jsonsql`,
  'vue-iclient/src/common/_utils/style/theme/theme.json': `@supermap/vue-iclient-${type}/lib/_utils/style/theme/theme.json`,
  [`vue-iclient/src/${type}/style`]: `@supermap/vue-iclient-${type}/lib/style.js`,
  'vue-iclient/src/init': `@supermap/vue-iclient-${type}/lib/init.js`
};

const libExternal = origin.includes('-index') ? installExternals : Object.assign({}, externals, libExtral);

exports.libExternals = {
  leaflet: [Object.assign({}, leafletExternals, libExternal), leafletExternalsFun, nodeExternals()],
  mapboxgl: [Object.assign({}, mapboxglExteranls, libExternal), mapboxglExteranlsFun, nodeExternals()]
};

exports.leafletExternals = [leafletExternals, leafletExternalsFun];

exports.mapboxglExteranls = [mapboxglExteranls, mapboxglExteranlsFun];
