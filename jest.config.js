const path = require('path');
process.env.VUE_CLI_BABEL_TARGET_NODE = true;
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;

module.exports = {
  rootDir: path.resolve(__dirname),
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  testRegex: "./test/.*\\.spec\\.(js|vue)$",
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/(.*)$': '<rootDir>/libs/$1',
    '^@mocks/(.*)$': '<rootDir>/test/unit/mocks/$1'
  },
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    // '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': '<rootDir>/node_modules/jest-transform-stub'
  },
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/test/unit/setup.js'],
  mapCoverage: true,
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!**/node_modules/**'
  ],
  transformIgnorePatterns: ["node_modules/(?!(mapbox-gl)/)"],
  modulePaths: [
    "src",
    "node_modules"
  ],

  cache: false

 }
