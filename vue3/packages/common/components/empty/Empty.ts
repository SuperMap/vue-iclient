import type { EmptyProps } from 'ant-design-vue'
import { Empty } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmEmpty = createWrappedComponent<EmptyProps>(Empty, 'empty')

export default SmEmpty
