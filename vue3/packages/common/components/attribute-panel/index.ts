import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import AttributePanel from './attribute-panel.vue'

export const SmAttributePanel: SFCWithInstall<typeof AttributePanel> = withInstall(AttributePanel)
export default SmAttributePanel

export * from './types'
export type { AttributePanelInstance } from './instance'
