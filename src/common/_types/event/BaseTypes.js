/* Copyright© 2000 - 2021 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */

export var StringExt = {

  startsWith: function (str, sub) {
    return (str.indexOf(sub) === 0);
  },

  contains: function (str, sub) {
    return (str.indexOf(sub) !== -1);
  },

  trim: function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  },

  camelize: function (str) {
    var oStringList = str.split('-');
    var camelizedString = oStringList[0];
    for (var i = 1, len = oStringList.length; i < len; i++) {
      var s = oStringList[i];
      camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
    }
    return camelizedString;
  },

  format: function (template, context, args) {
    if (!context) {
      context = window;
    }

    // Example matching:
    // str   = ${foo.bar}
    // match = foo.bar
    var replacer = function (str, match) {
      var replacement;

      // Loop through all subs. Example: ${a.b.c}
      // 0 -> replacement = context[a];
      // 1 -> replacement = context[a][b];
      // 2 -> replacement = context[a][b][c];
      var subs = match.split(/\.+/);
      for (var i = 0; i < subs.length; i++) {
        if (i === 0) {
          replacement = context;
        }

        replacement = replacement[subs[i]];
      }

      if (typeof replacement === 'function') {
        replacement = args ? replacement.apply(null, args) : replacement();
      }

      // If replacement is undefined, return the string 'undefined'.
      // This is a workaround for a bugs in browsers not properly
      // dealing with non-participating groups in regular expressions:
      // http://blog.stevenlevithan.com/archives/npcg-javascript
      if (typeof replacement === 'undefined') {
        return 'undefined';
      } else {
        return replacement;
      }
    };

    return template.replace(String.tokenRegEx, replacer);
  },

  /**
   * @member {RegExp} [String.tokenRegEx]
   * @description 寻找带 token 的字符串，默认为 tokenRegEx=/\$\{([\w.]+?)\}/g。
   * @example
   * Examples: ${a}, ${a.b.c}, ${a-b}, ${5}
   */
  tokenRegEx: /\$\{([\w.]+?)\}/g,

  /**
   * @member {RegExp} [String.numberRegEx]
   * @description 判断一个字符串是否只包含一个数值，默认为 numberRegEx=/^([+-]?)(?=\d|\.\d)\d*(\.\d*)?([Ee]([+-]?\d+))?$/。
   */
  numberRegEx: /^([+-]?)(?=\d|\.\d)\d*(\.\d*)?([Ee]([+-]?\d+))?$/,

  /**
   * @function String.isNumeric
   * @description 判断一个字符串是否只包含一个数值。
   * @example
   * (code)
   * String.isNumeric("6.02e23") // true
   * String.isNumeric("12 dozen") // false
   * String.isNumeric("4") // true
   * String.isNumeric(" 4 ") // false
   * (end)
   * @returns {boolean} 字符串包含唯一的数值，返回 true；否则返回 false。
   */
  isNumeric: function (value) {
    return String.numberRegEx.test(value);
  },

  /**
   * @function String.numericIf
   * @description 把一个看似数值型的字符串转化为一个数值。
   * @returns {(number|string)} 如果能转换为数值则返回数值，否则返回字符串本身。
   */
  numericIf: function (value) {
    return String.isNumeric(value) ? parseFloat(value) : value;
  }

};

/**
 * @name Number
 * @namespace
 * @category BaseTypes Util
 * @description 数值操作的一系列常用扩展函数。
 */
export var NumberExt = {

  decimalSeparator: '.',

  thousandsSeparator: ',',

  limitSigDigs: function (num, sig) {
    var fig = 0;
    if (sig > 0) {
      fig = parseFloat(num.toPrecision(sig));
    }
    return fig;
  },

  format: function (num, dec, tsep, dsep) {
    dec = (typeof dec !== 'undefined') ? dec : 0;
    tsep = (typeof tsep !== 'undefined') ? tsep : Number.thousandsSeparator;
    dsep = (typeof dsep !== 'undefined') ? dsep : Number.decimalSeparator;

    if (dec != null) {
      num = parseFloat(num.toFixed(dec));
    }

    var parts = num.toString().split('.');
    if (parts.length === 1 && dec == null) {
      // integer where we do not want to touch the decimals
      dec = 0;
    }

    var integer = parts[0];
    if (tsep) {
      var thousands = /(-?[0-9]+)([0-9]{3})/;
      while (thousands.test(integer)) {
        integer = integer.replace(thousands, '$1' + tsep + '$2');
      }
    }

    var str;
    if (dec === 0) {
      str = integer;
    } else {
      var rem = parts.length > 1 ? parts[1] : '0';
      if (dec != null) {
        rem = rem + new Array(dec - rem.length + 1).join('0');
      }
      str = integer + dsep + rem;
    }
    return str;
  }
};

// if (!NumberExt.prototype.limitSigDigs) {
//   /**
//    * APIMethod: Number.limitSigDigs
//    * 限制浮点数的有效数字位数.
//    * @param {integer} sig -有效位数。
//    * @returns {integer} 将数字四舍五入到指定数量的有效位数。
//    *           如果传入值 为 null、0、或者是负数, 返回值 0。
//    */
//   NumberExt.prototype.limitSigDigs = function (sig) {
//     return NumberExt.limitSigDigs(this, sig);
//   };
// }

export var FunctionExt = {

  bind: function (func, object) {
    // create a reference to all arguments past the second one
    var args = Array.prototype.slice.apply(arguments, [2]);
    return function () {
      // Push on any additional arguments from the actual function call.
      // These will come after those sent to the bind call.
      var newArgs = args.concat(
        Array.prototype.slice.apply(arguments, [0])
      );
      return func.apply(object, newArgs);
    };
  },

  bindAsEventListener: function (func, object) {
    return function (event) {
      return func.call(object, event || window.event);
    };
  },

  False: function () {
    return false;
  },

  True: function () {
    return true;
  },

  Void: function () {
  }

};

export var ArrayExt = {

  /**
   * @function Array.filter
   * @description 过滤数组，提供了 ECMA-262 标准中 Array.prototype.filter 函数的扩展。详见：{@link http://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/filter}
   * @param {Array} array - 要过滤的数组。
   * @param {function} callback - 数组中的每一个元素调用该函数。</br>
   *     如果函数的返回值为 true，该元素将包含在返回的数组中。该函数有三个参数: 数组中的元素，元素的索引，数组自身。</br>
   *     如果设置了可选参数 caller，在调用 callback 时，使用可选参数 caller 设置为 callback 的参数。</br>
   * @param {Object} [caller] - 在调用 callback 时，使用参数 caller 设置为 callback 的参数。
   * @returns {Array} callback 函数返回 true 时的元素将作为返回数组中的元素。
   */
  filter: function (array, callback, caller) {
    var selected = [];
    if (Array.prototype.filter) {
      selected = array.filter(callback, caller);
    } else {
      var len = array.length;
      if (typeof callback !== 'function') {
        throw new TypeError();
      }
      for (var i = 0; i < len; i++) {
        if (i in array) {
          var val = array[i];
          if (callback.call(caller, val, i, array)) {
            selected.push(val);
          }
        }
      }
    }
    return selected;
  }
};
