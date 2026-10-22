import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import DataEditor from './data-editor.vue'
import DataEditorDialog from './data-editor-dialog.vue'

export const SmDataEditor: SFCWithInstall<typeof DataEditor> = withInstall(DataEditor)

export const SmDataEditorDialog: SFCWithInstall<typeof DataEditorDialog> =
  withInstall(DataEditorDialog)

export default SmDataEditor

export * from './types'

export type { DataEditorInstance, DataEditorDialogInstance } from './instance'
