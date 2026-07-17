import type { PropType } from 'vue'
import type { SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type { OpennessAnalysisOptions } from 'vue-iclient-core/utils/scene/openness-analysis'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export interface SceneOpennessAnalysisProps extends CardProps, ControlProps, ThemeProps, SceneGetterProps {
  options?: OpennessAnalysisOptions
}

export const sceneOpennessAnalysisProps = () => ({
  options: { type: Object as PropType<OpennessAnalysisOptions>, default: () => ({}) }
})

export const sceneOpennessAnalysisPropsDefault = getPropsDefaults<SceneOpennessAnalysisProps>(
  Object.assign(cardProps(), themeProps(), controlProps(), sceneGetterProps(), sceneOpennessAnalysisProps())
)
