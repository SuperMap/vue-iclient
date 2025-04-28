import Vue from 'vue';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';
import themeFactory from 'vue-iclient/src/common/_utils/style/theme/theme.json';
import { dealWithTheme, ThemeStyleParams } from 'vue-iclient/src/common/_utils/style/color/serialColors';
import { objectWithoutProperties } from 'vue-iclient/src/common/_utils/util';

interface triggerParams {
  triggerEvent: boolean;
  ignoreElements: string[];
}

export const setTheme = (themeStyle: any = {}, triggerInfo?: triggerParams) => {
  let acceptedThemeStyle = themeStyle;
  if (typeof themeStyle === 'string') {
    acceptedThemeStyle = themeFactory.find((item: ThemeStyleParams) => item.label === themeStyle) || themeFactory[1];
  } else if (acceptedThemeStyle.componentBackground) {
    if (!acceptedThemeStyle.collapseCardHeaderBg) {
      acceptedThemeStyle.collapseCardHeaderBg = acceptedThemeStyle.componentBackground;
    }
    if (!acceptedThemeStyle.collapseCardBackground) {
      acceptedThemeStyle.collapseCardBackground = acceptedThemeStyle.componentBackground;
    }
  }
  acceptedThemeStyle = objectWithoutProperties(acceptedThemeStyle, (triggerInfo || {}).ignoreElements || []);
  const nextThemeData = dealWithTheme(acceptedThemeStyle);
  const nextTheme = {
    ...nextThemeData.themeStyle
  };
  if (themeStyle && (typeof themeStyle === 'string' || 'componentBackground' in themeStyle)) {
    nextTheme.background = nextTheme.componentBackground;
  }
  globalEvent.$options.theme = nextTheme;
  if (!triggerInfo || triggerInfo.triggerEvent === true) {
    globalEvent.$emit('change-theme', nextTheme);
  }
  // @ts-ignore
  if (!Vue.iclient) {
    // @ts-ignore
    Vue.iclient = { theme: nextTheme };
  } else {
    // @ts-ignore
    Vue.iclient.theme = nextTheme;
  }
};
