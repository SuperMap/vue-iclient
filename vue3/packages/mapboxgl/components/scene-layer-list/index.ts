import { withInstall } from '@supermapgis/common/utils/index.common'
import webscene from './webscene.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmWebScene: SFCWithInstall<typeof webscene> = withInstall(webscene)
export default SmWebScene

export * from './types'
export type { WebSceneInstance } from './instance'
