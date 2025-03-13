import installer from './defaults'
export * from '@supermapgis/mapboxgl/components'
export * from '@supermapgis/mapboxgl/hooks'
export * from '@supermapgis/common/components/index.common'
export * from '@supermapgis/common/hooks/index.common'
export * from './make-installer'

export const install = installer.install
export default installer

// export { default as dayjs } from 'dayjs'
