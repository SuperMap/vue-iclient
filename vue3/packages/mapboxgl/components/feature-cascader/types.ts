import type { ShortEmits } from '@supermapgis/common/utils/index.common'
import type { DataConfig } from '@supermapgis/mapboxgl/hooks'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'
import type { CSSProperties } from 'vue'

export const featureCascaderProps = () => ({
  // {idField, titleField, dataset, parentField, children}
  config: {
    type: Object
  },
  popupClassName: {
    type: String,
    default: 'sm-component-feature-cascader__dropdown'
  },
  changeOnSelect: {
    type: Boolean,
    default: false
  },
  value: {
    type: Array
  },
  popupStyle: {
    type: Object
  }
})

// export type FeatureCascaderProps = Partial<ExtractPropTypes<ReturnType<typeof FeatureCascaderProps>>>
export interface FeatureCascaderProps {
  config?: DataConfig
  popupClassName?: string
  changeOnSelect?: boolean
  value?: Array<string | number>
  dropdownStyle?: CSSProperties
}

export const featureCascaderPropsDefault = getPropsDefaults<FeatureCascaderProps>(
  Object.assign(featureCascaderProps())
)

export type FeatureCascaderEvents = {
  change: [{ value: Array<string | number>, feature: any }]
}

export type FeatureCascaderEmits = ShortEmits<FeatureCascaderEvents>
