import type { RowProps } from 'ant-design-vue'
import { Row } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmRow = createWrappedComponent<RowProps>(Row, 'row')

export default SmRow
