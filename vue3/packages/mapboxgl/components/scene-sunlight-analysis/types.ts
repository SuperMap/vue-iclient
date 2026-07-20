import type { PropType } from 'vue'
import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type { SunlightAnalysisOptions } from 'vue-iclient-core/utils/scene/sunlight-analysis'
import {
  getPropsDefaults,
  sceneGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

/** 日照色带配置项 */
export interface GradientItem {
  key: string
  label: string
  stops: [string, number][]
}

/** 默认日照色带列表 */
export const DEFAULT_GRADIENT_LIST: GradientItem[] = [
  {
    key: 'rainbow',
    label: '渐变彩虹',
    stops: [
      ['rgba(148, 0, 211, 1)', 0],
      ['rgba(75, 0, 130, 1)', 0.2],
      ['rgba(0, 0, 255, 1)', 0.4],
      ['rgba(0, 255, 0, 1)', 0.6],
      ['rgba(255, 255, 0, 1)', 0.8],
      ['rgba(255, 0, 0, 1)', 1]
    ]
  },
  {
    key: 'blueWhiteRed',
    label: '渐变蓝白红',
    stops: [
      ['rgba(0, 0, 255, 1)', 0],
      ['rgba(255, 255, 255, 1)', 0.5],
      ['rgba(255, 0, 0, 1)', 1]
    ]
  },
  {
    key: 'thermal',
    label: '渐变热力',
    stops: [
      ['rgba(0, 0, 0, 1)', 0],
      ['rgba(128, 0, 128, 1)', 0.25],
      ['rgba(255, 0, 0, 1)', 0.5],
      ['rgba(255, 255, 0, 1)', 0.75],
      ['rgba(255, 255, 255, 1)', 1]
    ]
  }
]

/**
 * 日照分析组件属性
 */
export interface SceneSunlightAnalysisProps
  extends CardProps,
    ControlProps,
    ThemeProps,
    SceneGetterProps {
  /** 日照分析初始配置 */
  options?: SunlightAnalysisOptions
  /** 日照色带列表 */
  gradientList?: GradientItem[]
}

export const sceneSunlightAnalysisProps = () => ({
  options: {
    type: Object as PropType<SunlightAnalysisOptions>,
    default: () => ({})
  },
  gradientList: {
    type: Array as PropType<GradientItem[]>,
    default: () => DEFAULT_GRADIENT_LIST.map((item) => ({ ...item, stops: [...item.stops] }))
  }
})

export const sceneSunlightAnalysisPropsDefault = getPropsDefaults<SceneSunlightAnalysisProps>(
  Object.assign(
    cardProps(),
    themeProps(),
    controlProps(),
    sceneGetterProps(),
    sceneSunlightAnalysisProps()
  )
)

export type SceneSunlightAnalysisEvents = {}

export type SceneSunlightAnalysisEmits = ShortEmits<SceneSunlightAnalysisEvents>

export default sceneSunlightAnalysisProps
