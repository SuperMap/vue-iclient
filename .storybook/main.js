const path = require('path');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
module.exports = {
  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/preset-scss',
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
    'storybook-readme'
  ],
  webpackFinal: async (config, { configType }) => {
    config.resolve.alias['core-js/modules'] = '@storybook/core/node_modules/core-js/modules';
    return config;
  }
};
