import type { ExtractPropTypes } from 'vue'
import type { Language } from '@supermapgis/common/locale'
import type { PropType } from 'vue'

export const definePropType = <T>(val: any): PropType<T> => val

export const configProviderProps = {
  /**
   * @description Locale Object
   */
  locale: {
    type: definePropType<Language>(Object)
  }
} as const
export type ConfigProviderProps = ExtractPropTypes<typeof configProviderProps>
