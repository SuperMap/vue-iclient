import globalEvent from 'vue-iclient-core/utils/global-event';
import themeFactory from 'vue-iclient-core/utils/style/theme/theme';
import { dealWithTheme, ThemeStyleParams } from 'vue-iclient-core/utils/style/color/serialColors';
import { objectWithoutProperties } from 'vue-iclient-core/utils/util';

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
  const nextThemeData = dealWithTheme(acceptedThemeStyle);
  const nextTheme = {
    ...nextThemeData.themeStyle
  };
  if (themeStyle && (typeof themeStyle === 'string' || 'componentBackground' in themeStyle)) {
    nextTheme.background = nextTheme.componentBackground;
  }
  globalEvent.theme = nextTheme;
  if (!triggerInfo || triggerInfo.triggerEvent === true) {
    globalEvent.changeTheme(objectWithoutProperties(nextTheme, (triggerInfo || {}).ignoreElements || []));
  }
  return nextTheme;
};
