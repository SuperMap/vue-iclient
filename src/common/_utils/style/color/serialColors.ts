import colorPalette from 'vue-iclient/src/common/_utils/style/color/colorPalette';
import themeFactory from 'vue-iclient/src/common/_utils/style/theme/theme.json';
import { getColorWithOpacity, getDarkenColor } from 'vue-iclient/src/common/_utils/util';
import { isArray } from 'vue-iclient/src/common/_utils/vue-types/utils';
import cssVars from 'css-vars-ponyfill';

export interface styleConfigParams {
  id: string;
  className: string;
}

const lightTheme = themeFactory && themeFactory[1];
export type ThemeStyleParams = typeof lightTheme & styleConfigParams;

export interface FunctionColorParams {
  successColor?: string | string[];
  infoColor?: string | string[];
  warningColor?: string | string[];
  dangerColor?: string | string[];
}

export interface ExtraColorParams {
  [prop: string]: string;
}

export interface StyleReplacerParams {
  themeStyle: ThemeStyleParams;
  primarySerialColors?: string[];
  functionSerialColors?: FunctionColorParams;
  extraSerialColors: ExtraColorParams;
}

const $blue6 = '#1890ff';
const $green6 = '#52c41a';
const $glod6 = '#faad14';
const $red6 = '#f5222d';

const antdPrimaryColor = $blue6;
const antdFunctionColors: FunctionColorParams = {
  infoColor: $blue6,
  successColor: $green6,
  warningColor: $glod6,
  dangerColor: $red6
};

const isBrowser = typeof window !== 'undefined';
const isNativeSupport = isBrowser && window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)');

export function getPrimarySerialColors(nextThemeInfo?: ThemeStyleParams): string[] {
  const series = [];
  const nextThemeStyle = nextThemeInfo;
  let prevPrimaryColor: string;
  if (nextThemeStyle && nextThemeStyle.colorGroup && nextThemeStyle.colorGroup[0]) {
    prevPrimaryColor = nextThemeStyle.colorGroup[0];
  }
  const acceptColor: string = prevPrimaryColor || antdPrimaryColor;
  for (let index = 1; index <= 10; index++) {
    let nextColor: string;
    switch (index) {
      case 2:
        nextColor = nextThemeStyle.selectedColor || getColorWithOpacity(acceptColor, 0.15);
        break;
      case 5:
        nextColor = nextThemeStyle.hoverColor || colorPalette(acceptColor, index);
        break;
      case 6:
        nextColor = acceptColor;
        break;
      case 7:
        nextColor = nextThemeStyle.clickColor || colorPalette(acceptColor, index);
        break;
      default:
        nextColor = colorPalette(acceptColor, index);
        break;
    }
    series.push(nextColor);
  }
  return series;
}

export function getFunctionSerialColors(functionColors?: ThemeStyleParams): FunctionColorParams {
  const seriesIndex = [1, 2, 3, 4, 5, 6, 7];
  const acceptFunctionColors = functionColors || antdFunctionColors;
  const nextFunctionSerialColors: FunctionColorParams = {};
  for (const key in acceptFunctionColors) {
    if (Object.prototype.hasOwnProperty.call(antdFunctionColors, key)) {
      const color = acceptFunctionColors[key] || antdFunctionColors[key];
      nextFunctionSerialColors[key] = [];
      seriesIndex.forEach(item => {
        const nextColor = item === 6 ? color : colorPalette(color, item);
        nextFunctionSerialColors[key].push(nextColor);
      });
    }
  }
  return nextFunctionSerialColors;
}

export function getExtralColors(
  themeStyleData: ThemeStyleParams,
  primarySerialColors: string[],
  functionColors: FunctionColorParams
): ExtraColorParams {
  const tableHeaderSortActiveBg = getDarkenColor(themeStyleData.backgroundLight, 3);
  const extraSerialColors: ExtraColorParams = {
    textColorWithoutOpacity: getColorWithOpacity(themeStyleData.textColor, 1, false),
    backgroundWithoutOpacity: getColorWithOpacity(themeStyleData.background, 1, false),
    componentBackgroundWithoutOpacity: getColorWithOpacity(themeStyleData.componentBackground, 1, false),
    primaryShadowColor: getColorWithOpacity(primarySerialColors[4], 0.25),
    dangerShadowColor: getColorWithOpacity(functionColors.dangerColor[4], 0.25),
    disabledDarkenBgColor10: getDarkenColor(themeStyleData.disabledBgColor, 10),
    tableHeaderSortActiveBg,
    tableHeaderFilterActiveBg: getDarkenColor(tableHeaderSortActiveBg, 5)
  };
  return extraSerialColors;
}

export function dealWithTheme(nextThemeStyle: ThemeStyleParams): StyleReplacerParams {
  const defaultThemeStyle = nextThemeStyle.style || 'light';
  const defaultTheme = themeFactory.find((item: ThemeStyleParams) => item.label === defaultThemeStyle);
  // 合并 lightTheme 是因为可能其他 theme 没有完整的参数，如 disableColor
  const serialColorsReplacer = getPrimarySerialColors(
    Object.assign({ colorGroup: defaultTheme && defaultTheme.colorGroup }, nextThemeStyle)
  );
  const themeStyleData = Object.assign({}, lightTheme, defaultTheme, nextThemeStyle);
  const functionSerialColorsReplacer = getFunctionSerialColors(themeStyleData);
  const nextThemeStyleData = Object.assign({}, themeStyleData, {
    selectedColor: serialColorsReplacer[1],
    hoverColor: serialColorsReplacer[4],
    clickColor: serialColorsReplacer[6]
  });
  const nextThemeData = {
    themeStyle: nextThemeStyleData,
    primarySerialColors: serialColorsReplacer,
    functionSerialColors: functionSerialColorsReplacer,
    extraSerialColors: getExtralColors(themeStyleData, serialColorsReplacer, functionSerialColorsReplacer)
  };
  setRootStyle(nextThemeData);
  return nextThemeData;
}

function setRootStyle(themeData: StyleReplacerParams): void {
  const { themeStyle, primarySerialColors, functionSerialColors, extraSerialColors } = themeData;
  const primaryColor = themeStyle.colorGroup[0];
  const variables = {
    '--antd-wave-shadow-color': primaryColor,
    '--primary-color': primaryColor
  };
  const themeInfo = Object.assign({}, themeStyle, extraSerialColors);
  const themeKeys = Object.keys(themeInfo);
  primarySerialColors.forEach((color: string, index: number) => {
    const varKey = `--primary-${index + 1}`;
    variables[varKey] = color;
  });
  for (const key in functionSerialColors) {
    functionSerialColors[key].forEach((color: string, index: number) => {
      const varKey = `--${key.replace('Color', '')}-${index + 1}`;
      variables[varKey] = color;
    });
  }
  themeKeys.forEach((key: string) => {
    if (!isArray(themeInfo[key])) {
      const varKey = `--${key.replace(/[A-Z]/g, '-$&').toLowerCase()}`;
      variables[varKey] = themeInfo[key];
    }
  });
  const rootStyleSelector =
    themeStyle.styleConfig && themeStyle.styleConfig.className ? `.${themeStyle.styleConfig.className}` : ':root';
  const antdStyleId =
    themeStyle.styleConfig && themeStyle.styleConfig.id ? `${themeStyle.styleConfig.id}-style` : 'sm-component-style';
  const rootStyle = `${rootStyleSelector} ${JSON.stringify(variables, null, 2)
    .replace(/(:.+),/g, '$1;')
    .replace(/"/g, '')}`;
  let antStyleTag = document.getElementById(antdStyleId);
  if (!antStyleTag) {
    antStyleTag = document.createElement('style');
    antStyleTag.setAttribute('id', antdStyleId);
    antStyleTag.setAttribute('type', 'text/css');
    document.head.insertBefore(antStyleTag, document.head.firstChild);
    const options = {
      include: 'style#sm-component-style, link[href*=vue-iclient-mapboxgl], link[href*=styles]',
      silent: true,
      onlyLegacy: true,
      variables: {},
      watch: false
    };
    if (!isNativeSupport) {
      options.onlyLegacy = false;
      options.watch = true;
      options.variables = variables;
    }
    cssVars(options);
  }
  antStyleTag.innerHTML = rootStyle;
}
