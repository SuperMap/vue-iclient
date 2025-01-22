const path = require('path');

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
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      alias: {
        map: [['vue-iclient', path.resolve(__dirname, './')], ['vue-iclient-static', path.resolve(__dirname, '../static')]],
        extensions: ['.js', '.ts', '.vue', '.json']
      },
      node: {
        paths: ['node_modules', 'src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  extends: [
    'plugin:vue/base',
    'plugin:vue/essential',
    'standard',
    'eslint:recommended',
    '@vue/typescript',
    '@vue/typescript/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 6,
    ecmaFeatures: {
      legacyDecorators: true
    },
    babelOptions: {
      configFile: path.resolve(__dirname, './babel.config.js') // 指定 Babel 配置文件路径
    }
  },
  plugins: ['vue', 'import'], // '@typescript-eslint'

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
    'vue/require-default-prop': 0,
    'vue/require-render-return': 0,
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
    'no-case-declarations': 0,
    'import/no-named-default': 0,
    'no-void': 0,
    'dot-notation': 0,
    'keyword-spacing': 0,
    'no-async-promise-executor': 0,
    'prefer-promise-reject-errors': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/no-var-requires': 0,
    'vue/custom-event-name-casing': 0,
    'vue/max-attributes-per-line': 0,
    'no-delete-var': 2,
    'prefer-const': 0,
    // Ensure imports point to a file/module that can be resolved
    'import/no-unresolved': [2, { commonjs: true, amd: true }],
    // Ensure named imports correspond to a named export in the remote file
    'import/named': 2,
    // Ensure a default export is present, given a default import
    'import/default': 2,
    // Restrict which files can be imported in a given folder
    'import/no-restricted-paths': 2,
    // Forbid import of modules using absolute paths
    'import/no-absolute-path': 2,
    // Forbid named default exports
    // 'import/no-named-default': 2,
    // Report repeated import of the same module in multiple places
    'import/no-duplicates': 1,
    // Ensure consistent use of file extension within the import path
    'import/extensions': 0,
    // Ensure all imports appear before other statements
    'import/first': 1,
    // Enforce a newline after import statements
    'import/newline-after-import': 1,
    // Prevent importing the submodules of other modules
    'import/no-internal-modules': 0,
    // Forbid unassigned imports
    'import/no-unassigned-import': 0
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/no-this-alias':0,
        '@typescript-eslint/ban-types': [
          'error',
          {
            extendDefaults: false,
            types: {
              String: {
                message: 'Use string instead',
                fixWith: 'string'
              },
              Boolean: {
                message: 'Use boolean instead',
                fixWith: 'boolean'
              },
              Number: {
                message: 'Use number instead',
                fixWith: 'number'
              },
              Symbol: {
                message: 'Use symbol instead',
                fixWith: 'symbol'
              },
              object: {
                message: 'Use Object instead',
                fixWith: 'number'
              },
              '{}': {
                message: 'Use Object instead',
                fixWith: 'number'
              }
            }
          }
        ],
        'prefer-const': 0
      },
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  ]
};
