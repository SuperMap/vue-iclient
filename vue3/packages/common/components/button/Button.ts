import type { ButtonProps } from 'ant-design-vue'
import { Button as AButton } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmButton = createWrappedComponent<ButtonProps>(AButton)

export default SmButton
