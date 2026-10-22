import type { PropType } from 'vue'
import type {
  MapGetterEvents,
  MapGetterProps,
  ShortEmits,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

/** 数据编辑支持的数据来源类型 */
export type DataEditorSourceType = 'STRUCTURED_DATA' | 'REST_DATA'

/** 数据编辑器的明暗主题 */
export type DataEditorTheme = 'light' | 'dark'

/** 图层的可编辑状态：pending 表示权限查询中 */
export type DataEditorEditableState = 'pending' | 'editable' | 'readonly'

/** 数据编辑依赖的属性字段定义 */
export interface DataEditorField {
  field?: string
  name?: string
  alias?: string
  caption?: string
  display?: boolean
  editable?: boolean
  [propName: string]: any
}

/** 图层关联的数据信息 */
export interface DataEditorLayerDataInfo {
  id?: string | number
  type?: string
  dataType?: string
  url?: string
  name?: string
  displayName?: string
  dataName?: string | string[]
  datasetName?: string
  datasourceName?: string
  datasetUrl?: string
  token?: string
  [propName: string]: any
}

/** 图层编辑权限，由使用方根据服务端权限装配 */
export interface DataEditorPermissions {
  create?: boolean
  delete?: boolean
  geometryEditing?: boolean
  attributesEditing?: boolean
  [propName: string]: any
}

/** 数据编辑图层 */
export interface DataEditorLayer {
  id: string
  title?: string
  name?: string
  dataAlias?: string
  fields?: DataEditorField[]
  dataInfo?: DataEditorLayerDataInfo
  renderLayers?: string[]
  permissions?: DataEditorPermissions
  /** 直接指定该图层是否可编辑，优先级高于 checkEditable */
  editable?: boolean
  [propName: string]: any
}

/** 自定义图层可编辑性判断，可返回 Promise 以支持权限接口查询 */
export type DataEditorCheckEditable = (layer: DataEditorLayer) => boolean | Promise<boolean>

export const dataEditorProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-edit'
  },
  headerName: {
    type: String
  },
  /**
   * 待编辑的图层列表，只渲染带 id 的图层。
   * 数据编辑仅支持数据服务（rest/data）与结构化数据，其它类型的数据源不会出现在编辑能力内，
   * 使用方需自行按 `dataInfo.type` / `dataInfo.dataType` 过滤后再传入。
   */
  layers: {
    type: Array as PropType<DataEditorLayer[]>,
    default: () => []
  },
  /** 判断图层是否可编辑，未传时除显式 editable: false 外均可编辑 */
  checkEditable: {
    type: Function as PropType<DataEditorCheckEditable>
  },
  /** iPortal 服务地址，用于结构化数据集编辑，以 / 开头时按当前站点补全 */
  rootUrl: {
    type: String,
    default: ''
  },
  /** 编辑弹窗主题，默认跟随地图主题 */
  theme: {
    type: String as PropType<DataEditorTheme>
  },
  /** 编辑弹窗宽度 */
  dialogWidth: {
    type: [String, Number] as PropType<string | number>,
    default: '100vw'
  }
})

export interface DataEditorProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  iconClass?: string
  headerName?: string
  layers?: DataEditorLayer[]
  checkEditable?: DataEditorCheckEditable
  rootUrl?: string
  theme?: DataEditorTheme
  dialogWidth?: string | number
}

export const dataEditorPropsDefault = getPropsDefaults<DataEditorProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), dataEditorProps())
)

export type DataEditorEvents = MapGetterEvents & {
  /** 编辑保存后触发，参数为被编辑图层的 id */
  saved: [layerId: string]
  /** 打开编辑弹窗 */
  open: [layer: DataEditorLayer]
  /** 关闭编辑弹窗 */
  close: []
}

export type DataEditorEmits = ShortEmits<DataEditorEvents>

/** 编辑弹窗 props */
export interface DataEditorDialogProps {
  /** 待编辑图层 */
  layer?: DataEditorLayer | null
  /** 主地图实例，弹窗地图复用其构造函数与视图参数 */
  map?: any
  /** 主地图对应的 WebMap 实例，用于筛选业务图层 */
  webmap?: any
  /** iPortal 服务地址 */
  rootUrl?: string
  /** 编辑主题 */
  theme?: DataEditorTheme
  /** 弹窗宽度 */
  width?: string | number
}

export type DataEditorDialogEvents = {
  saved: [layerId: string]
  close: []
}

export default dataEditorProps
