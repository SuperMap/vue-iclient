import type { CSSProperties, ComputedRef, PropType, Ref } from 'vue'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults, themeProps } from '@supermapgis/common/utils/index.common'
import type {
  PopupInfo,
  PopupConfig
} from './popup-content-props'

export type {
  videoOptions,
  imageOptions,
  ContentInfo,
  Attribute,
  TextInfo,
  MediaInfo,
  ExtensionInfo,
  PopupInfo,
  PopupConfig,
  PopupContentContext,
  PopupContentProps
} from './popup-content-props'

export { popupContentProps, popupContentPropsDefault } from './popup-content-props'

/** ????? */
export interface PopupFieldItem {
  title: string
  value: any
  slotName?: any
}

/** 点选命中的图层信息 */
export interface ClickedLayerInfo {
  id: string
  type?: string
  name?: string
}

/**
 * 地图 / 场景交互适配层（hooks + ViewModel）需对齐的同名能力。
 * 通用 UI 只依赖该接口，不关心底层是 Map 还是 Scene。
 */
export interface AttributePopupInteraction {
  /** 是否渲染弹窗 */
  isRender: Ref<boolean>
  /** 是否多选模式 */
  isMultipleClick: Ref<boolean>
  /** 是否已选图层后的再次多选 */
  isSecMultipleClick: Ref<boolean>
  /** 最近一次点击坐标 */
  clickedLngLat: Ref<any>
  /** 命中图层列表 */
  clickedLayers: Ref<ClickedLayerInfo[]>
  /** 要素坐标列表（与 allPopupDatas 对齐） */
  lnglats: Ref<any[]>
  /** 当前图层查询到的弹窗数据列表 */
  allPopupDatas: Ref<PopupFieldItem[][]>
  /** 额外根节点样式（如场景固定定位） */
  rootStyle?: Ref<CSSProperties | Record<string, any>> | ComputedRef<CSSProperties | Record<string, any>>
  /** 额外根节点 class（如场景弹窗上下翻转 placement） */
  rootClass?: Ref<string> | ComputedRef<string>
  /** 点击事件信息（注入 CUSTOM 的 event） */
  clickEvent?: Ref<Record<string, any> | undefined> | ComputedRef<Record<string, any> | undefined>
  /** 运行环境（map/scene，注入 CUSTOM 的 context） */
  runtimeContext?: Ref<Record<string, any> | undefined> | ComputedRef<Record<string, any> | undefined>

  setLayerIds?: (layerIds: string[], sourceLayers?: string[][]) => void
  queryFeaturesByLayerId: (layerId: string) => void
  setHighlightLayerFilter: (
    layerId: string,
    identifyFields: { field: string; values: any[] }
  ) => void
  /** 更新弹窗挂载坐标（地图 Popup）；场景可空实现 */
  setPopupCoordinates: (coordinate: any) => void
  /** 绑定弹窗根节点（地图 Popup 挂载用）；场景可空实现 */
  bindRootEl?: (el: HTMLElement | null | undefined) => void
  removePopup: () => void
  clear: () => void
}

/** 通用属性弹窗 UI Props */
export interface BaseAttributePopupProps extends ThemeProps {
  popupInfos?: PopupInfo[]
  popupConfig?: PopupConfig
  multiSelect?: boolean
  /** 额外 class，如场景弹窗修饰类 */
  popupClass?: string
  /** 是否显示指向点击位置的尖角（场景弹窗用） */
  showPopupTip?: boolean
  /** 交互适配层（由地图 / 场景 hooks 提供） */
  interaction: AttributePopupInteraction
}

export const baseAttributePopupProps = () => ({
  popupInfos: {
    type: Array as PropType<PopupInfo[]>,
    default: () => []
  },
  popupConfig: {
    type: Object as PropType<PopupConfig>,
    default: () => ({})
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  popupClass: {
    type: String,
    default: ''
  },
  showPopupTip: {
    type: Boolean,
    default: false
  }
})

export const baseAttributePopupPropsDefault = getPropsDefaults<
  Omit<BaseAttributePopupProps, 'interaction'>
>(Object.assign(themeProps(), baseAttributePopupProps()))

export default baseAttributePopupProps
