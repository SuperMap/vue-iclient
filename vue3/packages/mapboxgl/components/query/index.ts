import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Query from './query.vue'

export const SmQuery: SFCWithInstall<typeof Query> = withInstall(Query)
export default SmQuery

export * from './types'
export type { QueryInstance } from './instance'
