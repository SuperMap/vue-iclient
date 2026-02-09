import { withInstall } from '@supermapgis/common/utils/index.common'
import videoPlayer from './video-player.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmVideoPlayer: SFCWithInstall<typeof videoPlayer> = withInstall(videoPlayer)
export default SmVideoPlayer

export * from './types'
export type { VideoPlayerInstance } from './instance'
