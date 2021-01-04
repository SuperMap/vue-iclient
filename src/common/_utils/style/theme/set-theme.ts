import globalEvent from '../../global-event';
import themeFactory from './theme.json';
import { dealWithTheme, ThemeStyleParams } from '../color/serialColors';

export const setTheme = (themeStyle: any = {}) => {
  let acceptedThemeStyle = themeStyle;
  if (typeof themeStyle === 'string') {
    acceptedThemeStyle = themeFactory.find((item: ThemeStyleParams) => item.label === themeStyle) || themeFactory[1];
  }
  const nextThemeData = dealWithTheme(acceptedThemeStyle);
  const nextTheme = {
    ...nextThemeData.themeStyle
  };
  if (themeStyle && (typeof themeStyle === 'string' || 'componentBackground' in themeStyle)) {
    nextTheme.background = nextTheme.componentBackground;
  }
  globalEvent.$options.theme = nextTheme;
  globalEvent.$emit('change-theme', nextTheme);
};
