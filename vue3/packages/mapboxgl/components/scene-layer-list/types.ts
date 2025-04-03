import type { PropType } from 'vue'
import type { ShortEmits, SceneGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, sceneGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

interface Operations {
  fitBounds: boolean,
  draggable: boolean
}
export const sceneLayerListProps = () => ({
  operations: {
    type: Object as PropType<Operations> ,
    default() {
      return {
        fitBounds: true,
        draggable: false
      };
    }
  }
})

// export type SceneLayerListProps = Partial<ExtractPropTypes<ReturnType<typeof sceneLayerListProps>>>
export interface SceneLayerListProps extends CardProps, ControlProps, ThemeProps, SceneGetterProps {
  operations?: Operations
}

export const sceneLayerListPropsDefault = getPropsDefaults<SceneLayerListProps>( 
  Object.assign(cardProps(), themeProps(), controlProps(), sceneGetterProps(), sceneLayerListProps())
)


export type SceneLayerListEvents = {
 
}

export type SceneLayerListEmits = ShortEmits<SceneLayerListEvents>

export default sceneLayerListProps
