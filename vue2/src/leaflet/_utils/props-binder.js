export const capitalizeFirstLetter = string => {
  if (!string || typeof string.charAt !== 'function') {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const propsBinder = (vueElement, props) => {
  for (const key in props) {
    const setMethodName = 'set' + capitalizeFirstLetter(key);
    if (vueElement[setMethodName]) {
      vueElement.$watch(
        key,
        newVal => {
          vueElement[setMethodName](newVal);
        },
        {
          deep: true
        }
      );
    }
  }
};
