import type { PropType } from 'vue'
import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type { SkylineAnalysisOptions } from 'vue-iclient-core/utils/scene/skyline-analysis'
import {
  getPropsDefaults,
  sceneGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

/**
 * 天际线分析组件属性
 */
export interface SceneSkylineAnalysisProps
  extends CardProps,
    ControlProps,
    ThemeProps,
    SceneGetterProps {
  /** 天际线分析初始配置 */
  options?: SkylineAnalysisOptions
}

export const sceneSkylineAnalysisProps = () => ({
  options: {
    type: Object as PropType<SkylineAnalysisOptions>,
    default: () => ({})
  }
})

export const sceneSkylineAnalysisPropsDefault = getPropsDefaults<SceneSkylineAnalysisProps>(
  Object.assign(
    cardProps(),
    themeProps(),
    controlProps(),
    sceneGetterProps(),
    sceneSkylineAnalysisProps()
  )
)

export type SceneSkylineAnalysisEvents = {}

export type SceneSkylineAnalysisEmits = ShortEmits<SceneSkylineAnalysisEvents>

export default sceneSkylineAnalysisProps
