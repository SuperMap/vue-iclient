import type { ExtractPropTypes } from 'vue'

export const webMapTypes = ['default', 'primary'] as const

export const webMapProps = {
  /**
   * @description webMap type
   */
  type: {
    type: String,
    values: webMapTypes,
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
export const webMapEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent
}

export type WebMapProps = ExtractPropTypes<typeof webMapProps>
export type WebMapEmits = typeof webMapEmits

export type WebMapType = WebMapProps['type']

export interface WebMapConfigContext {
  autoInsertSpace?: boolean
}
