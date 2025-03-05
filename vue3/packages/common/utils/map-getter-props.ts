import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const mapGetterProps = () => ({
  mapTarget: {
    type: String
  }
})

// export type MapGetterProps = Partial<ExtractPropTypes<ReturnType<typeof mapGetterProps>>>
export type MapGetterProps = {
  mapTarget?: string
}

export const mapGetterPropsDefault = getPropsDefaults<MapGetterProps>(mapGetterProps())

export type MapGetterEvents = {
  loaded: []
}

export type MapGetterEmits = MapGetterEvents

export default mapGetterProps