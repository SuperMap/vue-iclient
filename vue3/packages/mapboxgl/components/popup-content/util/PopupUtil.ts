import { isString } from 'lodash-es';
import { default as CalcExpression, ExperssionTypes, AttributeTypes } from './CalcExpression';

export function formatValue2String(v?: boolean | string | number): string {
    if (v === undefined) {
        return ''
    }
    if (isString(v)) {
        return v
    }
    return v + ''
}

const PopupUtil = {
    /**
     * 获取string或expression数据结构的数据的值
     */
    getResult(val?: string | ExperssionTypes, attributes?: AttributeTypes): string {
        if (!attributes) {
            return '';
        }
        const value = Array.isArray(val) ? CalcExpression(attributes, val) : val;
        return value === undefined ? '' : value;
    }
};
export default PopupUtil;
