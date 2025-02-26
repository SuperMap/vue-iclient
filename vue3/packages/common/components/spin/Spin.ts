import type { SpinProps } from 'ant-design-vue'
import { Spin as ASpin } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmSpin = createWrappedComponent<SpinProps>(ASpin)

export default SmSpin
