import type { ExtractPropTypes } from 'vue'


export const attributesProps = {
  loading: Boolean
} as const
export const attributesEmits = {
  click: (evt: MouseEvent) => evt instanceof MouseEvent
}

export type AttributesProps = ExtractPropTypes<typeof attributesProps>
export type AttributesEmits = typeof attributesEmits

