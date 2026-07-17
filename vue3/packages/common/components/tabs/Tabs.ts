import type { TabPaneProps, TabsProps } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { Tabs } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmTabs = createWrappedComponent<TabsProps>(Tabs, 'tabs')

export const SmTabPane = defineComponent<TabPaneProps>({
  ...SmTabs.TabPane,
  name: 'SmTabPane'
})

export default SmTabs
