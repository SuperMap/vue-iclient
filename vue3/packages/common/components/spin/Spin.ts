import type { SpinProps } from 'ant-design-vue'
import { Spin } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

const SmSpin = createWrappedComponent<SpinProps>(Spin, 'spin')

export default SmSpin
