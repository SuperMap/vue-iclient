import type { DropdownProps } from 'ant-design-vue'
import { Dropdown as ADropdown } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmDropdown = createWrappedComponent<DropdownProps>(ADropdown)

export default SmDropdown
