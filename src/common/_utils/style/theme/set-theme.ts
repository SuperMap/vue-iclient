import globalEvent from '../../global-event';
import themeFactory from './theme.json';
import { dealWithTheme, ThemeStyleParams } from '../color/serialColors';

export const setTheme = (themeStyle: any = {}) => {
  if (typeof themeStyle === 'string') {
    themeStyle = themeFactory.find((item: ThemeStyleParams) => item.label === themeStyle) || themeFactory[1];
  }
  const nextThemeData = dealWithTheme(themeStyle);
  const nextTheme = {
    ...nextThemeData.themeStyle,
    background: nextThemeData.themeStyle.componentBackground
  };
  globalEvent.$options.theme = nextTheme;
  globalEvent.$emit('change-theme', nextTheme);
};
