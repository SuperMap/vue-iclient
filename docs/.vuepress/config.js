module.exports = {
  base: process.argv[4] || '/',
  locales: {
    // 每个语言对象的键(key)，是语言的访问路径。
    // 然而，一种特例是将 '/' 作为默认语言的访问路径。
    '/': {
      lang: 'zh-CN',
      title: 'Vue-iClient-MapboxGL',
      description: 'Vue-iClient-MapboxGL'
    }
    // '/en/': {
    //   lang: 'en-US', // 这个值会被设置在 <html> 的 lang 属性上
    //   title: 'Vue-iClient-MapboxGL',
    //   description: 'Vue components'
    // }
  },
  dest: process.argv[5],
  title: 'vue components by supermap',
  description: 'vue components',
  configureWebpack: {
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json']
    },
    externals: [
      function(context, request, callback) {
        if (/\/static\/libs\/mapboxgl\/mapbox-gl-enhance/.test(request)) {
          return callback(null, {
            root: 'mapboxgl',
            commonjs: '../../static/libs/mapboxgl/mapbox-gl-enhance.js',
            commonjs2: '../../static/libs/mapboxgl/mapbox-gl-enhance.js',
            amd: '../../static/libs/mapboxgl/mapbox-gl-enhance.js'
          });
        }
        if (/\/static\/libs\/deckgl\/deck.gl/.test(request)) {
          return callback(null, {
            root: 'DeckGL',
            commonjs: '../../static/libs/deckgl/deck.gl.min.js',
            commonjs2: '../../static/libs/deckgl/deck.gl.min.js',
            amd: '../../static/libs/deckgl/deck.gl.min.js'
          });
        }
        if (/\/static\/libs\/echarts-layer\/EchartsLayer/.test(request)) {
          return callback(null, {
            root: 'EchartsLayer',
            commonjs: '../../static/libs/echarts-layer/EchartsLayer.js',
            commonjs2: '../../static/libs/echarts-layer/EchartsLayer.js',
            amd: '../../static/libs/echarts-layer/EchartsLayer.js'
          });
        }
        if (/\/static\/libs\/iclient-mapboxgl\/iclient-mapboxgl/.test(request)) {
          return callback(null, {
            root: 'SuperMap',
            commonjs: '../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
            commonjs2: '../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js',
            amd: '../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js'
          });
        }
        callback();
      }
    ],
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                configFile: false,
                presets: ['@vue/babel-preset-jsx'],
                ignore: ['../../static/libs/json-sql/jsonsql.js']
              }
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                appendTsxSuffixTo: [/\.vue$/]
              }
            }
          ]
        }
      ]
    }
  },
  themeConfig: {
    lastUpdated: '最后更新时间',
    activeHeaderLinks: true,
    repo: 'SuperMap/vue-iclient',
    locales: {
      '/': {
        label: '简体中文',
        selectText: '选择语言',
        nav: [
          {
            text: '组件',
            link: '/zh/api/'
          },
          {
            text: 'Storybook',
            link: '../../../../../storybook/vue/index.html',
            target:'_blank'
          }
        ],
        sidebar: {
          '/zh/api/': [
            {
              title: '开发指南',
              collapsable: false,
              children: ['guide/installation', 'guide/quick-start', 'guide/i18n', 'guide/custom-theme']
            },
            {
              title: '组件',
              collapsable: false,
              children: [
                'web-map/map',
                'web-scene/scene',
                'map-compare/compare',
                {
                  title: '地图子组件',
                  collapsable: false,
                  children: [
                    'control/layer-list',
                    'control/legend',
                    'control/mini-map',
                    'control/pan',
                    'control/zoom',
                    'control/scale',
                    'control/measure',
                    'control/draw',
                    'control/query',
                    'control/search',
                    'control/open-file',
                    'control/identify',
                    'control/layer-manager'
                  ]
                },
                {
                  title: '天地图子组件',
                  collapsable: false,
                  children: ['tdt/tdt-route', 'tdt/tdt-search', 'tdt/tdt-map-switcher']
                },
                {
                  title: '可视化组件',
                  collapsable: false,
                  children: [
                    'layer/geojson',
                    'layer/raster-tile',
                    'layer/vector-tile',
                    'layer/animate-marker',
                    'layer/fire',
                    'layer/heatmap',
                    'layer/cluster',
                    'layer/unique-theme',
                    'layer/range-theme',
                    'layer/rank-symbol-theme',
                    'layer/label-theme',
                    'layer/graph-theme',
                    'layer/mapv',
                    'layer/echarts',
                    'layer/deckgl',
                    'layer/dataflow',
                    'layer/track'
                  ]
                },
                {
                  title: '图表组件',
                  collapsable: false,
                  children: ['chart/echart', 'chart/liquid', 'chart/progress']
                },
                {
                  title: '基础组件',
                  collapsable: false,
                  children: [
                    'common/time-text',
                    'common/text',
                    'common/indicator',
                    'common/icon',
                    'common/image',
                    'common/iframe',
                    'common/text-list',
                    'common/border',
                    'common/video-player'
                  ]
                }
              ]
            }
          ]
        }
      },
      '/en/': {
        label: 'English',
        selectText: 'Languages'
      }
    }
  }
};
