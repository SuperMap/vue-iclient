import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const sceneGetterProps = () => ({
  sceneTarget: {
    type: String
  }
})

// export type SceneGetterProps = Partial<ExtractPropTypes<ReturnType<typeof sceneGetterProps>>>
export type SceneGetterProps = {
  sceneTarget?: string
}

export const sceneGetterPropsDefault = getPropsDefaults<SceneGetterProps>(sceneGetterProps())

export type SceneGetterEvents = {
  loaded: []
}

export type SceneGetterEmits = SceneGetterEvents

export default sceneGetterProps