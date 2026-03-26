import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import directoryTree from './directory-tree.vue'

export const SmDirectoryTree: SFCWithInstall<typeof directoryTree> = withInstall(directoryTree)
export default SmDirectoryTree

export * from './types'
export type { DirectoryTreeInstance } from './instance'
