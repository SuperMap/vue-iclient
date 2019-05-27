export const reservedDecimal = (val, precise) => {
  return Number(val).toFixed(precise);
};
// 清除数字（字符串型的）的逗号
export const clearNumberComma = num => {
  if (num.replace) {
    num = num.replace(/,/g, '');
  }
  return num;
};
export default { reservedDecimal, clearNumberComma };
