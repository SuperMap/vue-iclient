import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Search from './search.vue'

export const SmSearch: SFCWithInstall<typeof Search> = withInstall(Search)
export default SmSearch

export * from './types'
export type { SearchInstance } from './instance'
