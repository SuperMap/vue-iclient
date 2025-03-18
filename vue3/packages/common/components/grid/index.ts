import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Row from './Row'
import Col from './Col'

export type { RowInstance, ColInstance } from './instance'
export * from './types'

export const SmRow: SFCWithInstall<typeof Row> = withInstall(Row)
export const SmCol: SFCWithInstall<typeof Col> = withInstall(Col)

