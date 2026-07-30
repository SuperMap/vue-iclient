import { isString } from 'lodash-es';
import { default as CalcExpression, ExperssionTypes, AttributeTypes } from './CalcExpression';
import { TextInfosTypes } from './ExpressionConverter';
export type ElementTypes = "TEXT" | "FIELD" | "IMAGE" | "VIDEO" | "DIVIDER" | "CUSTOM"
export type InfosTypes = "TEXT" | "MEDIA" | "FIELD" | "DIVIDER" | "CUSTOM";
export type WebmapPopupElementsTypes = FieldInfosTypes | TextTypes | MediaInfosTypes | CustomTypes;

export interface CustomElementInfos {
    component: any;
    props?: Record<string, any>;
    data?: any;
    e?: any;
}

export type CustomTypes = {
    type: "CUSTOM";
    infos: CustomElementInfos;
}

export interface LayoutElementsTypes {
    type: InfosTypes;
    infos?: Array<MediaInfosTypes | LayoutFieldInfosTypes | TextInfosTypes> | CustomElementInfos;
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
        let mediaInfos: MediaInfosTypes[] = []
        const flushMedia = () => {
            if (mediaInfos.length > 0) {
                layoutElements.push({ type: "MEDIA", infos: mediaInfos });
                mediaInfos = [];
            }
        }
        popupElements.forEach((element, i) => {
            let elementType: ElementTypes = element.type;
            if (mediaInfos.length > 0
                && elementType !== "VIDEO" && elementType !== "IMAGE") {
                flushMedia();
            }
            if (elementType === "DIVIDER") {
                layoutElements.push({ type: "DIVIDER" });
            } else if (elementType === "VIDEO" || elementType === "IMAGE") {
                mediaInfos.push(element as MediaInfosTypes);
            } else if (elementType === "FIELD") {
                layoutElements.push({ type: "FIELD", infos: [element as FieldInfosTypes] });
            } else if (elementType === "TEXT") {
                layoutElements.push({ type: "TEXT", infos: (element as TextTypes).infos });
            } else if (elementType === "CUSTOM") {
                layoutElements.push({ type: "CUSTOM", infos: (element as CustomTypes).infos });
            }

            // 最后一个元素
            if (i === popupElements.length - 1
                && elementType !== "DIVIDER"
                && elementType !== "CUSTOM") {
                flushMedia();
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
            if (layoutElement.type === "CUSTOM") {
                const customInfos = layoutElement.infos as CustomElementInfos;
                // 未显式传入 data 时，用当前要素属性作为 data
                if (customInfos.data === undefined) {
                    customInfos.data = attributes;
                }
                return layoutElement;
            }
            if (!Array.isArray(layoutElement.infos)) return layoutElement;
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