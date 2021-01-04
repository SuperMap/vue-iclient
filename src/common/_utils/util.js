// 获取当前时间返回置顶格式
import { getLanguage, geti18n } from '../../common/_lang';
import colorcolor from 'colorcolor';
import getCenter from '@turf/center';
import omit from 'omit.js';
import tinyColor from 'tinycolor2';

export function getDateTime(timeType) {
  return geti18n().d(new Date(), timeType.replace(/\+/g, '_'), getLanguage());
}
// hex -> rgba
export function hexToRgba(hex, opacity) {
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  );
}
export function isTransparent(color) {
  const rgba = colorcolor(color, 'rgba');
  return +rgba.match(/(\d(\.\d+)?)+/g)[3] === 0;
}
// 保留指定位数的小数
export function reservedDecimal(val, precise) {
  return Number(val).toFixed(precise);
}
// 清除数字（字符串型的）的逗号
export function clearNumberComma(num) {
  if (num.replace) {
    num = num.replace(/,/g, '');
  }
  return num;
}
/**
 * 判断是否地理X坐标
 * @param data
 */
export function isXField(data) {
  var lowerdata = data.toLowerCase();
  return (
    lowerdata === 'x' ||
    lowerdata === 'smx' ||
    lowerdata === 'jd' ||
    lowerdata === '经度' ||
    lowerdata === '东经' ||
    lowerdata === 'longitude' ||
    lowerdata === 'lot' ||
    lowerdata === 'lon' ||
    lowerdata === 'lng' ||
    lowerdata === 'x坐标'
  );
}

/**
 * 判断是否地理Y坐标
 * @param data
 */
export function isYField(data) {
  var lowerdata = data.toLowerCase();
  return (
    lowerdata === 'y' ||
    lowerdata === 'smy' ||
    lowerdata === 'wd' ||
    lowerdata === '纬度' ||
    lowerdata === '北纬' ||
    lowerdata === 'latitude' ||
    lowerdata === 'lat' ||
    lowerdata === 'y坐标'
  );
}

export function getColorWithOpacity(color, opacity, isStack = true) {
  if (!color) {
    return color;
  }
  const originColor = tinyColor(color);
  const originOpacity = originColor.getAlpha();
  if (isStack) {
    originColor.setAlpha(originOpacity * opacity);
  } else {
    originColor.setAlpha(opacity);
  }
  const nextColor = originColor.toRgbString();
  return nextColor;
}

export function getDerivedColorsByTextColor(textColor, opacity) {
  if (!textColor) {
    return textColor;
  }
  const baseTextColorOpacity = 0.65;
  const originTextColor = tinyColor(textColor);
  const originOpacity = originTextColor.getAlpha();
  originTextColor.setAlpha(originOpacity * opacity / baseTextColorOpacity);
  const derivedColor = originTextColor.toRgbString();
  return derivedColor;
}

export function parseUrl(url) {
  const urlRe = /^(\w+):\/\/([^/?]*)(\/[^?]+)?\??(.+)?/;
  return url.match(urlRe);
}

export function getDataType(data) {
  return Object.prototype.toString.call(data);
}

// 判断输入的地址是否符合地址格式
export function isMatchUrl(str) {
  var reg = new RegExp('(https?|http|file|ftp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
  return reg.test(str);
}
// 判断是否为日期
export function isDate(data) {
  let reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/gi;
  return reg.test(data);
}

// 判断是否为数值
export function isNumber(data) {
  let mdata = Number(data);
  if (mdata === 0) {
    return true;
  }
  return !isNaN(mdata);
}

export function getFeatureCenter(feature) {
  const coordinates = ((feature || {}).geometry || {}).coordinates;
  const hasCoordinates = coordinates && !!coordinates.length;
  if (!hasCoordinates) {
    return;
  }
  let featureType = feature.geometry.type;
  let center;
  if (featureType === 'LineString') {
    center = coordinates[parseInt(coordinates.length / 2)];
  } else if (featureType === 'MultiLineString') {
    let coord = coordinates[parseInt(coordinates.length / 2)];
    center = coord[parseInt(coord.length / 2)];
  } else {
    center = getCenter(feature).geometry.coordinates;
  }
  return center;
}

export function getValueCaseInsensitive(properties, searchKey) {
  const isObj = getDataType(properties) === '[object Object]';
  if (!searchKey || !isObj) {
    return '';
  }
  const lowerSearchKey = searchKey.toLocaleLowerCase();
  for (let key in properties) {
    if (key.toLocaleLowerCase() === lowerSearchKey) {
      return properties[key];
    }
  }
  return '';
}

export function filterInvalidData(datasetOptions, features) {
  const xFields = datasetOptions.map(item => item.xField);
  const yFields = datasetOptions.map(item => item.yField);
  const nextFeatures = features.filter(feature => {
    const matchXField = xFields.find(item => feature.properties.hasOwnProperty(item));
    const matchYField = yFields.find(item => ![undefined, null, ''].includes(feature.properties[item]));
    return !!(matchXField && matchYField);
  });
  return nextFeatures;
}
export function handleWithCredentials(url, iportalServiceProxyUrl, defaultValue = false) {
  if (!iportalServiceProxyUrl) {
    return defaultValue;
  }
  return url.indexOf(iportalServiceProxyUrl) >= 0 || defaultValue;
}

export function handleDataParentRes(url, parentResId, parentResType = 'DATA') {
  if (!parentResId) {
    return url;
  }
  return urlAppend(url, `parentResType=${parentResType}&parentResId=${parentResId}`);
}
export function urlAppend(url, paramStr) {
  var newUrl = url;
  if (paramStr) {
    if (paramStr.indexOf('?') === 0) {
      paramStr = paramStr.substring(1);
    }
    var parts = (url + ' ').split(/[?&]/);
    newUrl += parts.pop() === ' ' ? paramStr : parts.length ? '&' + paramStr : '?' + paramStr;
  }
  return newUrl;
}

export function objectWithoutProperties(obj, omitKeys = []) {
  return omit(obj, omitKeys);
}

export function getDarkenColor(color, amount) {
  return tinyColor(color)
    .darken(amount)
    .toString();
}

const ARROW_POSITION_MAP = {
  top: 'Bottom',
  bottom: 'Top',
  left: 'Right',
  right: 'Left'
};

export function setPopupArrowStyle(color) {
  const popup = document.querySelectorAll('.sm-mapboxgl-tabel-popup');
  if (popup) {
    popup.forEach(item => {
      let position = item.className.replace(/.+mapboxgl-popup-anchor-([a-z]+)/, '$1');
      if (ARROW_POSITION_MAP[position]) {
        const popupArrow = item.querySelector('.mapboxgl-popup-tip');
        if (popupArrow) {
          popupArrow.style[`border${ARROW_POSITION_MAP[position]}Color`] = color;
        }
      }
    });
  }
}
