/* Copyright© 2000 - 2022 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */

export let FunctionExt = {
  bind: function (func, object) {
    // create a reference to all arguments past the second one
    let args = Array.prototype.slice.apply(arguments, [2]);
    return function () {
      // Push on any additional arguments from the actual function call.
      // These will come after those sent to the bind call.
      let newArgs = args.concat(
        Array.prototype.slice.apply(arguments, [0])
      );
      return func.apply(object, newArgs);
    };
  },

  bindAsEventListener: function (func, object) {
    return function (event) {
      return func.call(object, event || window.event);
    };
  }
};
