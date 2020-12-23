/* Copyright© 2000 - 2021 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */

export var Util = {};
/**
 * @name Util
 * @namespace
 * @category BaseTypes Util
 * @description common 工具类。
 */

Util.extend = function (destination, source) {
  destination = destination || {};
  if (source) {
    for (var property in source) {
      var value = source[property];
      if (value !== undefined) {
        destination[property] = value;
      }
    }
    var sourceIsEvt = typeof window.Event === 'function' && source instanceof window.Event;

    if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty('toString')) {
      destination.toString = source.toString;
    }
  }
  return destination;
};
/**
 * @description 对象拷贝。
 * @param {Object} [des] - 目标对象。
 * @param {Object} soc - 源对象。
 */
Util.copy = function (des, soc) {
  des = des || {};
  var v;
  if (soc) {
    for (var p in des) {
      v = soc[p];
      if (typeof v !== 'undefined') {
        des[p] = v;
      }
    }
  }
};
/**
 * @description 销毁对象，将其属性置空。
 * @param {Object} [obj] - 目标对象。
 */
Util.reset = function (obj) {
  obj = obj || {};
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (typeof obj[p] === 'object' && obj[p] instanceof Array) {
        for (var i in obj[p]) {
          if (obj[p][i].destroy) {
            obj[p][i].destroy();
          }
        }
        obj[p].length = 0;
      } else if (typeof obj[p] === 'object' && obj[p] instanceof Object) {
        if (obj[p].destroy) {
          obj[p].destroy();
        }
      }
      obj[p] = null;
    }
  }
};

/**
 * @description 获取 HTML 元素数组。
 * @returns {Array.<HTMLElement>} HTML 元素数组。
 */
Util.getElement = function () {
  var elements = [];

  for (var i = 0, len = arguments.length; i < len; i++) {
    var element = arguments[i];
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (arguments.length === 1) {
      return element;
    }
    elements.push(element);
  }
  return elements;
};

/**
 * @description instance of 的跨浏览器实现。
 * @param {Object} o - 对象。
 * @returns {boolean} 是否是页面元素。
 */
Util.isElement = function (o) {
  return !!(o && o.nodeType === 1);
};

/**
 * @description 判断一个对象是否是数组。
 * @param {Object} a - 对象。
 * @returns {boolean} 是否是数组。
 */
Util.isArray = function (a) {
  return (Object.prototype.toString.call(a) === '[object Array]');
};

/**
 * @description 从数组中删除某一项。
 * @param {Array} array - 数组。
 * @param {Object} item - 数组中要删除的一项。
 * @returns {Array} 执行删除操作后的数组。
 */
Util.removeItem = function (array, item) {
  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i] === item) {
      array.splice(i, 1);
    }
  }
  return array;
};

/**
 * @description 获取某对象再数组中的索引值。
 * @param {Array} array - 数组。
 * @param {Object} obj - 对象。
 * @returns {number} 某对象再数组中的索引值。
 */
Util.indexOf = function (array, obj) {
  if (array == null) {
    return -1;
  } else {
    // use the build-in function if available.
    if (typeof array.indexOf === 'function') {
      return array.indexOf(obj);
    } else {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] === obj) {
          return i;
        }
      }
      return -1;
    }
  }
};

Util.getElement = function () {
  var elements = [];

  for (var i = 0, len = arguments.length; i < len; i++) {
    var element = arguments[i];
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (arguments.length === 1) {
      return element;
    }
    elements.push(element);
  }
  return elements;
};

Util.lastSeqID = 0;

Util.createUniqueID = function (prefix) {
  if (prefix == null) {
    prefix = 'id_';
  }
  Util.lastSeqID += 1;
  return prefix + Util.lastSeqID;
};
