// 获取当前时间返回置顶格式
export function getDateTime(source, timeType) {
  let myDate = new Date();
  let Y = myDate.getFullYear();
  let M = myDate.getMonth() + 1;
  M = M < 10 ? '0' + M : M;
  let D = myDate.getDate();
  D = D < 10 ? '0' + D : D;
  let h = myDate.getHours();
  h = h < 10 ? '0' + h : h;
  let m = myDate.getMinutes();
  m = m < 10 ? '0' + m : m;
  let s = myDate.getSeconds();
  s = s < 10 ? '0' + s : s;
  let W = myDate.getDay();
  W = getWeek(W);
  if (source === 'time') {
    let date = Y + '年' + M + '月' + D + '日';
    let dataSecond = date + ' ' + h + '时' + m + '分' + s + '秒';
    let dataSecondWeek = dataSecond + ' ' + W;
    if (window.lang === 'en-US') {
      date = D + '-' + M + '-' + Y;
      dataSecond = h + ':' + m + ':' + s + ' ' + date;
      dataSecondWeek = h + ':' + m + ':' + s + ' ' + W + ' ' + date;
    }
    switch (timeType) {
      // 下面case给时间组件使用
      case 'date':
        return date;
      case 'date+second':
        return dataSecond;
      case 'date+second+week':
        return dataSecondWeek;
    }
  } else if (source === 'chart') {
    let second = h + ':' + m + ':' + s;
    let minute = h + ':' + m;
    let data = M + '-' + D;
    switch (timeType) {
      case 'second':
        return second;
      case 'minute':
        return minute;
      case 'date':
        return data;
    }
  }
}
// 获取星期
export function getWeek(week) {
  switch (week) {
    case 0:
      return window.lang === 'en-US' ? 'Sunday' : '星期日';
    case 1:
      return window.lang === 'en-US' ? 'Monday' : '星期一';
    case 2:
      return window.lang === 'en-US' ? 'Tuesday' : '星期二';
    case 3:
      return window.lang === 'en-US' ? 'Wednesday' : '星期三';
    case 4:
      return window.lang === 'en-US' ? 'Thursday' : '星期四';
    case 5:
      return window.lang === 'en-US' ? 'Friday' : '星期五';
    case 6:
      return window.lang === 'en-US' ? 'Saturday' : '星期六';
  }
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
