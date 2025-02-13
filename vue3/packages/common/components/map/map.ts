import type { ExtractPropTypes } from 'vue'

export const MapTypes = ['default', 'primary'] as const

export const MapProps = {
  type: {
    type: String,
    values: MapTypes,
    default: ''
  },
  /**
   * @description determine whether it's loading
   */
  loading: Boolean,
  autoInsertSpace: {
    type: Boolean,
    default: undefined
  }
} as const
export const MapEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent
}

export type MapProps = ExtractPropTypes<typeof MapProps>
export type MapEmits = typeof MapEmits

export type MapType = MapProps['type']

export interface MapConfigContext {
  autoInsertSpace?: boolean
}
