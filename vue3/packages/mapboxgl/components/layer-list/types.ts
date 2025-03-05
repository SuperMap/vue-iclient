import type { PropType, CSSProperties } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits } from '@supermapgis/common/utils/index.common'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import type {
  PaginationParams,
  FieldConfigParams,
  AssociateWithMapParams,
  StatisticsParams,
  TableParams,
  ToolbarParams
} from '@supermapgis/mapboxgl/components/attributes/types'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/components/theme/theme'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export interface AttributesParams {
  dataset?: Record<string, any>
  enabled?: boolean
  getContainer?: Function
  style?: CSSProperties & { width: string; height: string }
  position?: ControlPosition
  title?: string
  iconClass?: string
  associateWithMap?: AssociateWithMapParams
  statistics?: StatisticsParams
  toolbar?: ToolbarParams
  table?: TableParams
  fieldConfig?: FieldConfigParams
  pagination?: PaginationParams
  customHeaderRow?: Function
  customRow?: Function
  layerName?: string
}

export interface LayerListItem {
  id: string
  title: string
  type: string
  visible: boolean
  renderSource: Object
  renderLayers: string[]
  dataSource: Object
  themeSetting: Object
  children?: LayerListItem[]
  CLASS_NAME?: string
  CLASS_INSTANCE?: Object
}

export interface TreeNodeDropEvent {
  node: {
    eventKey: string
    pos: string
    children: LayerListItem[]
    expanded: boolean
  }
  dragNode: {
    eventKey: string
  }
  dropPosition: number
  dropToGap: boolean
}

export interface Operations {
  fitBounds: boolean
  draggable: false
  opacity: false
}

export const layerListProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-layer-list'
  },
  attributes: {
    type: Object as PropType<AttributesParams>,
    default: () => ({})
  },
  operations: {
    type: Object as PropType<Operations>,
    default: () => ({
      fitBounds: true,
      draggable: false,
      opacity: false
    })
  },
  position: {
    type: String as PropType<ControlPosition>,
    default: 'top-left'
  }
})

// export type LayerListProps = Partial<ExtractPropTypes<ReturnType<typeof layerListProps>>>
export interface LayerListProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  attributes?: AttributesParams
  operations?: Operations
}

export const layerListPropsDefault = getPropsDefaults<LayerListProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), layerListProps())
)

export type LayerListEvents = MapGetterEvents

export type LayerListEmits = ShortEmits<LayerListEvents>

export default layerListProps
