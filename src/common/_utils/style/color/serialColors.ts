import colorPalette from './colorPalette';
import themeFactory from '../theme/theme.json';
import { getColorWithOpacity } from '../../util';

const firstThemeItem = themeFactory[1];

export type ThemeStyleParams = typeof firstThemeItem;

export interface StyleReplacerParams {
  cssStyle: string;
  themeStyle: ThemeStyleParams;
}

interface functionColorParams {
  successColor?: string | string[];
  infoColor?: string | string[];
  warningColor?: string | string[];
  dangerColor?: string | string[];
}

const $blue6 = '#1890ff';
const $green6 = '#52c41a';
const $glod6 = '#faad14';
const $red6 = '#f5222d';
const $grey3 = '#f5f5f5';
const $grey5 = '#d9d9d9';
const $grey6 = '#bfbfbf';
const $fadeBlack = 'rgba(0, 0, 0, 0.65)';

const antdPrimaryColor = $blue6;
const antdFunctionColors: functionColorParams = {
  infoColor: $blue6,
  successColor: $green6,
  warningColor: $glod6,
  dangerColor: $red6
};
const antdOtherColors: ThemeStyleParams = {
  textColor: $fadeBlack,
  disabledBgColor: $grey3,
  borderBaseColor: $grey5,
  placeholderColor: $grey6
};

export function getPrimarySerialColors(nextThemeInfo?: ThemeStyleParams): string[] {
  const series = [];
  const nextThemeStyle = nextThemeInfo || {};
  const prevPrimaryColor = nextThemeStyle.colorGroup && nextThemeStyle.colorGroup[0];
  const acceptColor: string = prevPrimaryColor || antdPrimaryColor;
  for (let index = 1; index <= 10; index++) {
    let nextColor: string;
    switch (index) {
      case 2:
        if (nextThemeStyle.selectedColor) {
          nextColor = nextThemeStyle.selectedColor;
        } else {
          nextColor = prevPrimaryColor ? getColorWithOpacity(acceptColor, 0.15) : colorPalette(acceptColor, index);
        }
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

export function getFunctionSerialColors(functionColors?: ThemeStyleParams): functionColorParams {
  const seriesIndex = [1, 3, 5, 6];
  const acceptFunctionColors = functionColors || antdFunctionColors;
  const nextFunctionSerialColors: functionColorParams = {};
  for (let key in acceptFunctionColors) {
    if (antdFunctionColors.hasOwnProperty(key)) {
      const color = acceptFunctionColors[key] || antdFunctionColors[key];
      nextFunctionSerialColors[key] = [];
      seriesIndex.forEach(item => {
        const nextColor = item === 6 ? color : colorPalette(color, item);
        const subColor = colorPalette(nextColor, item);
        nextFunctionSerialColors[key].push(nextColor);
        item !== 6 && nextFunctionSerialColors[key].push(subColor);
      });
    }
  }
  return nextFunctionSerialColors;
}

export function dealWithTheme(nextThemeStyle: ThemeStyleParams): StyleReplacerParams {
  const prevCssStyle = require('../theme/base').default;
  const defaultThemeStyle = nextThemeStyle.style || 'light';
  const defaultTheme = themeFactory.find((item: ThemeStyleParams) => item.label === defaultThemeStyle);
  // 合并 firstThemeItem 是因为可能其他 theme 没有完整的参数，如 disableColor
  const themeStyleData = Object.assign({}, firstThemeItem, defaultTheme, nextThemeStyle);
  const antdPrimarySerialColors = getPrimarySerialColors();
  const antdFunctionSerialColors = getFunctionSerialColors();
  const serialColorsReplacer = getPrimarySerialColors(themeStyleData);
  let cssStyle = prevCssStyle;
  antdPrimarySerialColors.forEach((item: string, index: number) => {
    const nextItem = item.replace('(', '\\(').replace(')', '\\)');
    cssStyle = cssStyle.replace(new RegExp(nextItem, 'ig'), serialColorsReplacer[index]);
  });
  const otherSerialColors = Object.assign({}, antdFunctionSerialColors, antdOtherColors);
  for (let key in otherSerialColors) {
    if (themeStyleData[key]) {
      const datas =
        typeof otherSerialColors[key] === 'string' ? [].concat(otherSerialColors[key]) : otherSerialColors[key];
      datas.forEach((item: string, index: number) => {
        const nextItem = item.replace('(', '\\(').replace(')', '\\)');
        cssStyle = cssStyle.replace(new RegExp(nextItem, 'ig'), themeStyleData[key]);
      });
    }
  }
  return {
    cssStyle,
    themeStyle: {
      ...themeStyleData,
      selectedColor: serialColorsReplacer[1],
      hoverColor: serialColorsReplacer[4],
      clickColor: serialColorsReplacer[6]
    }
  };
}
