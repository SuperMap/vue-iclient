import type { DatePickerProps } from 'ant-design-vue'
import { DatePicker } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmDatePicker = createWrappedComponent<DatePickerProps>(DatePicker, 'picker')

export default SmDatePicker
