const path = require('path');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
module.exports = {
  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/preset-scss',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          test: [/\.stories\.js?$/], //This is default
          include: [path.resolve(__dirname, '../stories')], // You can specify directories
        },
        loaderOptions: {
          prettierConfig: {
            printWidth: 80,
            singleQuote: false
          },
        },
      },
    },
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
    'storybook-readme'
  ],
  webpackFinal: async (config, { configType }) => {
    config.resolve.alias['core-js/modules'] = '@storybook/core/node_modules/core-js/modules';
    config.module.rules.push({
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    });
    return config;
  }
};
