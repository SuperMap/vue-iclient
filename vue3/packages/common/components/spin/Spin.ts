import type { SpinProps } from 'ant-design-vue'
import { Spin } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmSpin = createWrappedComponent<SpinProps>(Spin)

export default SmSpin
