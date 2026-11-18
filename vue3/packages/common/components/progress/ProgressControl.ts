import type { ProgressProps } from 'ant-design-vue'
import { Progress } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

export default createWrappedComponent<ProgressProps>(Progress, 'progress')
