import type { CheckboxProps } from 'ant-design-vue'
import { Checkbox as ACheckbox } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmCheckbox = createWrappedComponent<CheckboxProps>(ACheckbox)

export default SmCheckbox
