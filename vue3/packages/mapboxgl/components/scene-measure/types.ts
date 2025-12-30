import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export const sceneMeasureProps = () => ({
  
})

// export type SceneMeasureProps = Partial<ExtractPropTypes<ReturnType<typeof sceneMeasureProps>>>
export interface SceneMeasureProps extends CardProps, ControlProps, ThemeProps, SceneGetterProps {

}

export const sceneMeasurePropsDefault = getPropsDefaults<SceneMeasureProps>( 
  Object.assign(cardProps(), themeProps(), controlProps(), sceneGetterProps(), sceneMeasureProps())
)


export type SceneMeasureEvents = {
 
}

export type SceneMeasureEmits = ShortEmits<SceneMeasureEvents>

export default sceneMeasureProps
