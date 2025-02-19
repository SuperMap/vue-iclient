import type { PropType, CSSProperties } from 'vue'
import type { ShortEmits } from '@supermapgis/common/utils/vue-types'
import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import type {
  PaginationParams,
  FieldConfigParams,
  AssociateWithMapParams,
  StatisticsParams,
  TableParams,
  ToolbarParams
} from '@supermapgis/vue-iclient-mapboxgl/attributes/attributes.vue'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
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
    type: Object,
    default: () => ({})
  },
  operations: {
    type: Object,
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
export interface LayerListProps extends CardProps, ControlProps {
  attributes?: AttributesParams
  operations?: Operations
}

export const layerListPropsDefault = getPropsDefaults<LayerListProps>(
  Object.assign(cardProps(), controlProps(), layerListProps())
)

export type layerListEmitsMap = {
  loaded: () => void
}

export type LayerListEmits = ShortEmits<layerListEmitsMap>

export default layerListProps
