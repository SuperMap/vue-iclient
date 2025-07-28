import type { SpinProps } from 'ant-design-vue'
import { Spin } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export const SmSpin = createWrappedComponent<SpinProps>(Spin, 'spin')

export default SmSpin
