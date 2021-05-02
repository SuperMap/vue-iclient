const path = require('path');

process.env.VUE_CLI_BABEL_TARGET_NODE = true;
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;

module.exports = {
  rootDir: path.resolve(__dirname),
  moduleFileExtensions: ['js', 'json', 'vue', 'ts'],
  // testRegex: "./test/.*\\.spec\\.(js|vue)$",
  testRegex: '.*\\.spec\\.js$',
  moduleNameMapper: {
    '^vue-iclient/(.*)$': '<rootDir>/$1',
    '^@libs/(.*)$': '<rootDir>/static/libs/$1',
    '^@mocks/(.*)$': '<rootDir>/test/unit/mocks/$1',
    '^@types_mapboxgl/(.*)$': '<rootDir>/src/mapboxgl/_types/$1',
    '^@types_common/(.*)$': '<rootDir>/src/common/_types/$1',
    '^@mixin/(.*)$': '<rootDir>/src/mapboxgl/_mixin/$1',
    '\\.(css|less)$': 'identity-obj-proxy',
    '@i18n/(.*)$': '<rootDir>/src/common/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/test/unit/assetsTransformer.js',
    '\\.(css|less)$': '<rootDir>/test/unit/assetsTransformer.js'
  },
  transform: {
    '^.+\\.ts$': '<rootDir>/node_modules/ts-jest',
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': '<rootDir>/node_modules/jest-transform-stub'
  },
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/test/unit/setup.js', '<rootDir>/test/jest.init.js', 'jest-canvas-mock'],
  // mapCoverage: true,
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts,vue}',
    '!src/main.js',
    '!**/node_modules/**',
    '!mapboxgl/*/__tests__/**/type.{js,jsx}'
  ],
  transformIgnorePatterns: ['node_modules/(?!(mapbox-gl|element-ui|ant-design-vue)/)'],
  modulePaths: ['src', 'node_modules'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
      babelConfig: true
    }
  },

  cache: false
};
