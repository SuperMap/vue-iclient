const path = require('path');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
module.exports = {
  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/preset-scss',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        sourceLoaderOptions: {
          injectStoryParameters: false
        }
      }
    },
    '@storybook/addon-knobs/register',
    '@storybook/addon-toolbars'
  ],
  webpackFinal: async (config, { configType }) => {
    config.optimization = {
      splitChunks: {
        chunks: 'all',
        minSize: 30 * 1024, // 30KB
        maxSize: 1024 * 1024 // 1MB
      }
    };
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
              javascriptEnabled: true
            }
          }
        }
      ]
    });
    return config;
  }
};
