import installer from './defaults'
export * from '@supermapgis/mapboxgl/components'
export * from '@supermapgis/mapboxgl/hooks'
export * from '@supermapgis/mapboxgl/utils'
export * from '@supermapgis/common/components/index.common'
export * from '@supermapgis/common/hooks/index.common'
export * from '@supermapgis/common/utils/index.common'
export * from 'vue-iclient-core/index'

export * from './make-installer'

export const install = installer.install
export default installer

// export { default as dayjs } from 'dayjs'
