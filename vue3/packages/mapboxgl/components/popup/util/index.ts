import { isString } from 'lodash-es';
import { default as CalcExpression, ExperssionTypes, AttributeTypes } from './CalcExpression';
import { TextInfosTypes } from './ExpressionConverter';
export type ElementTypes = "TEXT" | "FIELD" | "IMAGE" | "VIDEO" | "DIVIDER"
export type InfosTypes = "TEXT" | "MEDIA" | "FIELD" | "DIVIDER";
export type WebmapPopupElementsTypes = FieldInfosTypes | TextTypes | MediaInfosTypes;

export interface LayoutElementsTypes {
    type: InfosTypes;
    infos?: Array<MediaInfosTypes | LayoutFieldInfosTypes | TextInfosTypes>;
}
export type MediaInfosTypes = {
    type: ElementTypes;
    title?: string | ExperssionTypes;
    value?: string | ExperssionTypes;
}

export type TextTypes = {
    type: "TEXT",
    infos: TextInfosTypes[]
}
export type FieldInfosTypes = {
    type: ElementTypes;
    fieldName?: string;
}

export type LayoutFieldInfosTypes = {
    type: ElementTypes;
    fieldName?: string;
    value?: string;
    caption?: string;
    editable?: boolean;
}
export type DividerTypes = {
    type: "DIVIDER";
}

export function formatValue2String(v?: boolean | string | number): string {
    if (v === undefined) {
        return ''
    }
    if (isString(v)) {
        return v
    }
    return v + ''
}

/**
 * 公用函数集
 */
let PopupUtil = {

    /**
     * 将webmap中的elements转换成弹窗页面中所需要的数据结构
     */
    getLayoutElements(popupElements: WebmapPopupElementsTypes[]): LayoutElementsTypes[] {
        let layoutElements: LayoutElementsTypes[] = [];
        // 配置面板各类型对应的信息：
        let mediaElement: LayoutElementsTypes = { type: "MEDIA", infos: [] }
        popupElements.forEach((element, i) => {
            let elementType: ElementTypes = element.type;
            if (mediaElement.infos && mediaElement.infos.length > 0
                && elementType !== "VIDEO" && elementType !== "IMAGE") {
                layoutElements.push({ ...mediaElement });
                mediaElement = { type: "MEDIA", infos: [] };
            }
            if (elementType === "DIVIDER") {
                layoutElements.push({ type: "DIVIDER" });
            } else if (elementType === "VIDEO" || elementType === "IMAGE") {
                mediaElement.infos && mediaElement.infos.push(element);
            } else if (elementType === "FIELD") {
                layoutElements.push({ type: "FIELD", infos: [element] });
            } else if (elementType === "TEXT") {
                layoutElements.push({ type: "TEXT", infos: (element as TextTypes).infos });
            }

            // 最后一个元素
            if (i === popupElements.length - 1
                && elementType !== "DIVIDER"
                && mediaElement.infos
                && mediaElement.infos.length > 0) {
                layoutElements.push({ ...mediaElement });
            }
        })
        return layoutElements;
    },


    /**
     * 获取string或expression数据结构的数据的值
     */
    getResult(val?: string | ExperssionTypes, attributes?: AttributeTypes): string {
        if (!attributes) {
            return '';
        }
        const value = Array.isArray(val) ? CalcExpression(attributes, val) : val;
        return value === undefined ? '' : value;
    },

    /**
     * 根据layoutElements和attributes获取最终显示在当前弹窗上的值
     * return PopupElement 最终显示在当前弹窗上的值(不含表达式)
     */
    getResultElement(layoutElements: LayoutElementsTypes[], attributes?: AttributeTypes, editableFields?: string[], fieldCaptions?: { [key: string]: string }): LayoutElementsTypes[] {
        let resultElements: LayoutElementsTypes[] = layoutElements.map((layoutElement: LayoutElementsTypes) => {
            if (!layoutElement.infos) return layoutElement;
            if (layoutElement.type === "FIELD") {
                layoutElement.infos.forEach((fieldInfo: any) => {
                    fieldInfo.fieldName = PopupUtil.getResult(fieldInfo.fieldName, attributes);
                    fieldInfo.value = PopupUtil.getResult(["get", fieldInfo.fieldName], attributes);
                    fieldInfo.caption = fieldCaptions && fieldCaptions[fieldInfo.fieldName];
                    fieldInfo.editable = editableFields && editableFields.includes(fieldInfo.fieldName);
                })
            } else if (layoutElement.type === "MEDIA") {
                layoutElement.infos.forEach((mediaInfo: any) => {
                    mediaInfo.title = PopupUtil.getResult(mediaInfo.title, attributes)
                    mediaInfo.value = PopupUtil.getResult(mediaInfo.value, attributes)
                })
            } else {
                layoutElement.infos.forEach((textInfo: any) => {
                    textInfo.insert = PopupUtil.getResult(textInfo.insert, attributes)
                    if (textInfo.attributes && textInfo.attributes.link) {
                        textInfo.attributes.link = PopupUtil.getResult(textInfo.attributes.link, attributes)
                    }
                })
            }
            return layoutElement;
        })
        return resultElements;
    }

};
export default PopupUtil;