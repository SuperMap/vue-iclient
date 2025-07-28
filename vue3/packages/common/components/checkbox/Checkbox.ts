import type { CheckboxProps } from 'ant-design-vue'
import { Checkbox } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmCheckbox = createWrappedComponent<CheckboxProps>(Checkbox, 'checkbox')

export default SmCheckbox
