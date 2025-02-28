import type { DropdownProps } from 'ant-design-vue'
import { Dropdown } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmDropdown = createWrappedComponent<DropdownProps>(Dropdown)

export default SmDropdown
