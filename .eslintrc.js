// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    SuperMap: 'readonly',
    Cesium: 'readonly'
  },
  extends: ['plugin:vue/recommended', '@vue/standard'],
  parserOptions: {
    parser: 'babel-eslint'
  },
  plugins: ['vue', 'import'],
  rules: {
    'new-cap': 'off',
    'generator-star-spacing': 'off',
    'no-useless-escape': 'off',
    'no-mixed-operators': 0,
    'vue/max-attributes-per-line': [
      2,
      {
        singleline: 5,
        multiline: {
          max: 1,
          allowFirstLine: false
        }
      }
    ],
    'vue/attribute-hyphenation': 0,
    'vue/html-self-closing': 0,
    'vue/component-name-in-template-casing': 0,
    'vue/html-closing-bracket-spacing': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/no-parsing-error': 0,
    'vue/require-default-prop':0,
    'vue/require-render-return':0,
    'space-before-function-paren': 0,
    'no-console': 0,
    'no-tabs': 0,
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    semi: ['error', 'always'],
    'no-delete-var': 2,
    'prefer-const': 0
  }
};
