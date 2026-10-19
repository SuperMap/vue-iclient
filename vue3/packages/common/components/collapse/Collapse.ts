import type { CollapsePanelProps, CollapseProps } from 'ant-design-vue'
import { Collapse, CollapsePanel } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmCollapse = createWrappedComponent<CollapseProps>(Collapse, 'collapse')

export const SmCollapsePanel = defineComponent<CollapsePanelProps>({
  ...CollapsePanel,
  name: 'SmCollapsePanel'
})

export default SmCollapse
