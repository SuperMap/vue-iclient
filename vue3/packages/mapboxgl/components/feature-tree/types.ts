import type { ShortEmits } from '@supermapgis/common/utils/index.common'
import type { DataConfig } from '@supermapgis/mapboxgl/hooks'
import type { TreeProps } from 'ant-design-vue'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'

export const featureTreeProps = () => ({
  config: {
    type: Object
  },
  treeData: {
    type: Array
  }
})

// export type FeatureTreeProps = Partial<ExtractPropTypes<ReturnType<typeof FeatureTreeProps>>>
export interface FeatureTreeProps {
  config?: DataConfig
  treeData?: TreeProps['treeData']
}

export const featureTreePropsDefault = getPropsDefaults<FeatureTreeProps>(
  Object.assign(featureTreeProps())
)

export type FeatureTreeEvents = {
  select: [{ value: object, feature: any }]
}

export type FeatureTreeEmits = ShortEmits<FeatureTreeEvents>
