import type { InputNumberProps } from 'ant-design-vue'
import { InputNumber } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmInputNumber = createWrappedComponent<InputNumberProps>(InputNumber, 'input-number')

export default SmInputNumber
