import type { ExtractPropTypes } from 'vue'

export const layerListTypes = ['default', 'primary'] as const

export const layerListProps = {
  iconClass: {
    type: String,
    default: 'sm-components-icon-layer-list'
  },
  headerName: {
    type: String,
    default: () => 'layerList.title'
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
  mapTarget: String
} as const
export const layerListEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent
}

export type LayerListProps = ExtractPropTypes<typeof layerListProps>
export type LayerListEmits = typeof layerListEmits

export interface LayerListConfigContext {
  autoInsertSpace?: boolean
}
