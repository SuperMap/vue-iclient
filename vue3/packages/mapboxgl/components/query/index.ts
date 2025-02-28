import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import QueryComp from './Query.vue'

export const Query: SFCWithInstall<typeof QueryComp> = withInstall(QueryComp)
export default Query

export * from './query'
export type { Query } from './instance'
