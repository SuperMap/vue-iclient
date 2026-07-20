import type { CheckboxProps } from 'ant-design-vue'
import { Checkbox } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'
import SmCheckboxGroup from './CheckboxGroup'

const SmCheckbox = createWrappedComponent<CheckboxProps>(Checkbox, 'checkbox')

;(SmCheckbox as typeof SmCheckbox & { Group: typeof SmCheckboxGroup }).Group = SmCheckboxGroup

export { SmCheckbox, SmCheckboxGroup }
export default SmCheckbox
