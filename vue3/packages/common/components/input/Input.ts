import type { InputProps } from 'ant-design-vue'
import { Input as AInput } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmInput = createWrappedComponent<InputProps>(AInput)

export default SmInput
