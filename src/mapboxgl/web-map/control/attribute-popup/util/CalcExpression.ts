export type ExperssionTypes = any[];
export type OperatorTypes = 'get' | 'concat'; // 运算符类型
export type AttributeTypes = { [key: string]: any };

/**
 * Expression计算器
 */
function calcExpression(obj: AttributeTypes, expressArray: ExperssionTypes): string {
  // 取剩下的操作数or表达式，计算操作数的值
  let subExpression = expressArray.slice(1);
  let subResult: string[] = subExpression.map(item => {
    if (Array.isArray(item)) {
      return calcExpression(obj, item as ExperssionTypes);
    } else {
      return item;
    }
  });
  // 根据运算符返回结果
  let functions: { [key: string]: Function } = {
    get: function (params: string[]) {
      return obj[params[0]];
    },
    concat: function (params: string[]) {
      return params.join('');
    }
  };
  let op = expressArray[0] as OperatorTypes; // expression第一个值一定是运算符
  return functions[op](subResult);
}

export default calcExpression;
