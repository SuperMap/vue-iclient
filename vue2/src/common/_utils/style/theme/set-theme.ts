import Vue from 'vue';
import { setTheme as setCommonTheme } from 'vue-iclient-core/utils/style/theme/set-theme';

export const setTheme = (...args: any[]) => {
  const nextTheme = setCommonTheme(...args);
  // @ts-ignore
  if (!Vue.iclient) {
    // @ts-ignore
    Vue.iclient = { theme: nextTheme };
  } else {
    // @ts-ignore
    Vue.iclient.theme = nextTheme;
  }
};
