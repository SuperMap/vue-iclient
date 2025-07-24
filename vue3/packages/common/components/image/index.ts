import { withInstall } from '@supermapgis/common/utils/index.common'
import image from './image.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmImage: SFCWithInstall<typeof image> = withInstall(image)
export default SmImage

export * from './types'
export type { ImageInstance } from './instance'
