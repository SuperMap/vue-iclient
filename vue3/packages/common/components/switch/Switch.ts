import type { SwitchProps } from 'ant-design-vue'
import { Switch } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmSwitch = createWrappedComponent<SwitchProps>(Switch, 'switch')

export default SmSwitch
