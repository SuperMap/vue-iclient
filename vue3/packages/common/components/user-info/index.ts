import { withInstall } from '@supermapgis/common/utils/index.common'
import userInfo from './user-info.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmUserInfo: SFCWithInstall<typeof userInfo> = withInstall(userInfo)
export default SmUserInfo

export * from './types'
export type { UserInfoInstance } from './instance'
