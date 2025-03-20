import type { DropdownProps } from 'ant-design-vue'
import { Dropdown } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

const SmDropdown = createWrappedComponent<DropdownProps>(Dropdown, 'dropdown')

export default SmDropdown
