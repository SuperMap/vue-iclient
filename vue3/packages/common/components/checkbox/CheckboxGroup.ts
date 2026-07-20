import type { CheckboxGroupProps } from 'ant-design-vue'
import { Checkbox } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmCheckboxGroup = createWrappedComponent<CheckboxGroupProps>(
  Checkbox.Group as any,
  'checkbox'
)

export default SmCheckboxGroup
