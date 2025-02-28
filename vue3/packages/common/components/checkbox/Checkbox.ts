import type { CheckboxProps } from 'ant-design-vue'
import { Checkbox } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmCheckbox = createWrappedComponent<CheckboxProps>(Checkbox)

export default SmCheckbox
