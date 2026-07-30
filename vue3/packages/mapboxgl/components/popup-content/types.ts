import type { Component, PropType, CSSProperties } from 'vue'
import type { TextInfosTypes } from './util/ExpressionConverter'
import type { ExperssionTypes } from './util/CalcExpression'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'

export interface videoOptions {
  objectFit?: 'contain' | 'fill' | 'unset'
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
}
export interface imageOptions {
  previewMode?: 'full' | 'popup' | 'none'
}
interface hrefContentInfo {
  target?: '_parent' | '_self' | '_blank' | '_top'
  text?: string
}
export type ContentInfo = videoOptions | imageOptions | hrefContentInfo

export interface Attribute {
  type: 'FIELD'
  fieldName: string
  fieldCaption?: string
  contentType: 'text' | 'href' | 'image' | 'video'
  contentInfo?: ContentInfo
}

export type TextInfo = {
  type: 'TEXT'
  infos: TextInfosTypes
}

export interface MediaInfo {
  type: 'IMAGE' | 'VIDEO'
  title?: string
  value: string | ExperssionTypes
  titleStyle?: CSSProperties
  options?: imageOptions | videoOptions
}

interface DividerInfo {
  type: 'DIVIDER'
}

/** 平台注入给自定义弹窗组件的上下文 */
export interface PopupContentContext {
  /** 当前要素属性 */
  feature: Record<string, any>
  /** 当前图层本次点选的全部要素属性列表 */
  features: Record<string, any>[]
  /** 翻页索引 */
  index: number
  /** 图层信息 */
  layer: { id: string; title?: string }
  /** 点击事件信息 */
  event?: {
    lngLat?: [number, number] | { lng: number; lat: number }
    position?: { x: number; y: number }
    originalEvent?: any
    [key: string]: any
  }
  /** 运行环境 */
  context?: {
    mode?: 'map' | 'scene'
    target?: string
    [key: string]: any
  }
}

/** 自定义动态组件 infos */
export interface CustomElementInfos {
  /** 用户传入的自定义组件（直接动态渲染） */
  component: Component | string
  /** 用户自定义参数，原样透传给动态组件 */
  props?: Record<string, any>
  /**
   * @deprecated 请使用平台注入的 feature；保留兼容
   */
  data?: any
  /**
   * @deprecated 请使用平台注入的 event；保留兼容
   */
  e?: any
}

export interface CustomInfo {
  type: 'CUSTOM'
  infos: CustomElementInfos
}

export interface PopupInfo {
  title?: string
  layerId?: string | string[]
  fieldCaptions?: Record<string, string>
  identifyField?: string
  /** 用户自定义参数（可与 CUSTOM.infos.props 合并透传） */
  props?: Record<string, any>
  elements?: (Attribute | TextInfo | MediaInfo | DividerInfo | CustomInfo)[]
}

export interface PopupConfig {
  backgroundImage?: string
  autoResize?: boolean
  maxWidth?: string
  maxHeight?: string
  width?: string
  height?: string
  keyWordWrap?: 'ellipsis' | 'wrap'
  valueWordWrap?: 'ellipsis' | 'wrap'
}

export interface PopupContentProps {
  data?: Array<{ title: string; value: any; slotName?: any }>
  /** 当前图层全部要素对应的弹窗行数据（翻页） */
  featuresData?: Array<Array<{ title: string; value: any; slotName?: any }>>
  /** 当前翻页索引 */
  index?: number
  popupInfo?: PopupInfo
  popupConfig?: PopupConfig
  /** @deprecated 请使用 event */
  e?: any
  /** 点击事件信息，注入 CUSTOM 组件 */
  event?: PopupContentContext['event']
  /** 运行环境信息 */
  context?: PopupContentContext['context']
}

export const popupContentProps = () => ({
  data: {
    type: Array as PropType<Array<{ title: string; value: any; slotName?: any }>>,
    default: () => []
  },
  featuresData: {
    type: Array as PropType<Array<Array<{ title: string; value: any; slotName?: any }>>>,
    default: () => []
  },
  index: {
    type: Number,
    default: 0
  },
  popupInfo: {
    type: Object as PropType<PopupInfo>,
    default: () => ({})
  },
  popupConfig: {
    type: Object as PropType<PopupConfig>,
    default: () => ({})
  },
  e: {
    type: Object as PropType<any>,
    default: undefined
  },
  event: {
    type: Object as PropType<PopupContentContext['event']>,
    default: undefined
  },
  context: {
    type: Object as PropType<PopupContentContext['context']>,
    default: undefined
  }
})

export const popupContentPropsDefault = getPropsDefaults<PopupContentProps>(popupContentProps())

export default popupContentProps
