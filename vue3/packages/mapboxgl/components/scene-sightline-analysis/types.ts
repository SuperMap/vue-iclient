import type { PropType } from 'vue'
import type { SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type { SightlineAnalysisOptions } from 'vue-iclient-core/utils/scene/sightline-analysis'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export type SceneSightlineAnalysisMode = 'ViewShed' | 'Sightline' | 'SightNetwork'
export interface SceneSightlineAnalysisProps extends CardProps, ControlProps, ThemeProps, SceneGetterProps {
  defaultMode?: SceneSightlineAnalysisMode
  options?: SightlineAnalysisOptions
}
export const sceneSightlineAnalysisProps = () => ({
  defaultMode: { type: String as PropType<SceneSightlineAnalysisMode>, default: 'ViewShed' },
  options: { type: Object as PropType<SightlineAnalysisOptions>, default: () => ({}) }
})
export const sceneSightlineAnalysisPropsDefault = getPropsDefaults<SceneSightlineAnalysisProps>(Object.assign(cardProps(), themeProps(), controlProps(), sceneGetterProps(), sceneSightlineAnalysisProps()))
