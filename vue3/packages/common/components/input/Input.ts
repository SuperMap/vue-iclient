import type { InputProps } from 'ant-design-vue'
import { Input } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmInput = createWrappedComponent<InputProps>(Input, 'input')

export default SmInput
