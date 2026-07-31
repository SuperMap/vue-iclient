import { ExperssionTypes, OperatorTypes } from './CalcExpression'
export type ElementTypes = 'TEXT' | 'FIELD' | 'IMAGE' | 'VIDEO' | 'DIVIDER'
export type InfosTypes = 'TEXT' | 'MEDIA' | 'FIELD' | 'DIVIDER'

//webmap支持的富文本属性类型
export interface TextInfosTypes {
  insert?: string | ExperssionTypes
  attributes?: {
    link?: string | ExperssionTypes
    font?: string
    size?: 'small' | 'normal' | 'large' | 'huge'
    color?: string
    bold?: boolean
    underline?: boolean
    strike?: boolean
    align?: 'right' | 'left' | 'justify' | 'center'
    italic?: boolean
  }
}
/**
 * 公用函数集
 */
let ExpressionConverter = {
  /**
   * 将含占位符的string，转换为string或者是expression文本信息
   */
  getTextInfosExpression(newInfos: TextInfosTypes[], fields?: string[]) {
    if (fields && fields.length > 0) {
      newInfos.forEach((textInfo: TextInfosTypes) => {
        // 图片类型时，textInfo.insert为Object
        if (textInfo.insert && typeof textInfo.insert === 'string') {
          textInfo.insert = ExpressionConverter.convertValueToSave(fields, textInfo.insert)
        }
        if (textInfo.attributes && textInfo.attributes.link) {
          textInfo.attributes.link = ExpressionConverter.convertValueToSave(
            fields,
            textInfo.attributes.link
          )
        }
      })
    }
    return newInfos
  },

  /**
   * 将UI显示的值转换成要保存的值数据结构
   *@param {string} targetValue  要转换的值
   *@return { Expression | string}
   */
  convertValueToSave(fields: string[], targetValue: any) {
    if (targetValue && targetValue.indexOf('{') > -1 && targetValue.indexOf('}') > -1) {
      return ExpressionConverter.getStringToExperssion(fields, targetValue)
    } else {
      return targetValue
    }
  },

  /**
   * string or Expression数据结构的文本信息转换为可含占位符的string
   */
  getTextInfosString(textInfos: TextInfosTypes[]) {
    return textInfos.map((textInfo: TextInfosTypes) => {
      if (textInfo.insert) {
        textInfo.insert = ExpressionConverter.getUIStringValue(textInfo.insert)
      }
      if (textInfo.attributes && textInfo.attributes.link) {
        textInfo.attributes.link = ExpressionConverter.getUIStringValue(textInfo.attributes.link)
      }
      return textInfo
    })
  },

  /**
   * 将保存的值数据结构转换成可含占位符的string
   *@param { object} obj  要转换的值
   *@return {Expression} Expression数据结构
   */
  getUIStringValue(targetValue: string | ExperssionTypes) {
    if (Array.isArray(targetValue)) {
      return ExpressionConverter.calcExpressionToString(targetValue)
    } else {
      return targetValue
    }
  },

  /**
   * 将保存的expressArray数据结构转换成UI显示的含占位符的string
   *@param { object} obj  要转换的值
   *@return {Expression} Expression数据结构
   */
  calcExpressionToString(expressArray: ExperssionTypes[]): string {
    // 取剩下的操作数or表达式，计算操作数的值
    let subExpression: ExperssionTypes = expressArray.slice(1)
    let subResult: ExperssionTypes = subExpression.map((item: ExperssionTypes) => {
      if (Array.isArray(item)) {
        return ExpressionConverter.calcExpressionToString(item)
      } else {
        return item
      }
    })
    // 根据运算符返回结果
    let functions = {
      get: function (params: any) {
        return `{${params[0]}}`
      },
      concat: function (params: any) {
        return params.join('')
      }
    }
    //expression第一个值一定是运算符
    let op: OperatorTypes = expressArray[0] as any
    // 如果最后一个字符为回车或空格，则直接返回该符号
    return (subResult && functions[op] && functions[op](subResult)) || subResult
  },

  /**
   * 将含占位符{}的string转换为Expression数据结构
   *@param { Array } fields 属性信息
   *@param { string} stringValue  要转换的值
   *@return {Expression} Expression数据结构
   */
  getStringToExperssion(fields: string[], stringValue: string): ExperssionTypes[] {
    var isProp = (str: string) => {
      return fields.includes(str)
    }
    let arr: any[] = []
    stringValue.split('{').forEach(item => {
      if (!item) return
      if (item.indexOf('}') === item.length - 1) {
        //item!=="" 且最后一个字符为"}"
        let maybeProp: string = item.replace('}', '')
        // if (maybeProp) {
        if (isProp(maybeProp)) {
          arr.push(['get', maybeProp])
        } else {
          arr.push(`{${maybeProp}}`)
        }
        // }
      } else if (item.indexOf('}') === -1) {
        //item不含字符"}"
        arr.push(item)
      } else if (item) {
        //item!=="" 且 item含字符"}"，但是"}"后还有字符
        let subArr = item.split('}')
        let maybeProp = ['get', subArr[0]]
        // if (subArr[0]) {
        if (isProp(subArr[0])) {
          arr.push(maybeProp)
        } else {
          arr.push(`{${subArr[0]}}`)
        }
        // }
        subArr[1] && arr.push(subArr[1])
      }
    })
    return ['concat', ...arr]
  }
}
export default ExpressionConverter
