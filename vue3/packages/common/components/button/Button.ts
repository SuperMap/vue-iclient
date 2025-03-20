import type { ButtonProps } from 'ant-design-vue'
import { Button } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

const SmButton = createWrappedComponent<ButtonProps>(Button, 'btn')

export default SmButton
