import type { ShortEmits } from '@supermapgis/common/utils/index.common'
import type { DataConfig } from '@supermapgis/mapboxgl/hooks'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'

export const featureTreeProps = () => ({
  config: {
    type: Object
  }
})

// export type FeatureTreeProps = Partial<ExtractPropTypes<ReturnType<typeof FeatureTreeProps>>>
export interface FeatureTreeProps {
  config?: DataConfig
}

export const featureTreePropsDefault = getPropsDefaults<FeatureTreeProps>(
  Object.assign(featureTreeProps())
)

export type FeatureTreeEvents = {
  click: [Array<string>]
}

export type FeatureTreeEmits = ShortEmits<FeatureTreeEvents>
