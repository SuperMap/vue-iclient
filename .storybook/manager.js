import customTheme from './custom-theme';
import { addons } from '@storybook/addons';

addons.setConfig({
  theme: customTheme,
  showRoots: true
});