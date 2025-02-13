import { withInstall } from '@supermapgis/common/utils/index.common'
import map from './map.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const Map: SFCWithInstall<typeof map> = withInstall(map)
export default Map

export * from './map'
export type { MapInstance } from './instance'
