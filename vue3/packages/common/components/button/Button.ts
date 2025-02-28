import type { ButtonProps } from 'ant-design-vue'
import { Button } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmButton = createWrappedComponent<ButtonProps>(Button)

export default SmButton
