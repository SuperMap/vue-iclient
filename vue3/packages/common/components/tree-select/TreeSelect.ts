import type { TreeSelectProps } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { TreeSelect } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

const SmTreeSelect = createWrappedComponent<TreeSelectProps>(TreeSelect, 'treeSelect')

export const SmTreeSelectNode = defineComponent<TreeSelectProps>({
  ...SmTreeSelect.Option,
  name: 'SmTreeSelectNode'
})

export default SmTreeSelect
