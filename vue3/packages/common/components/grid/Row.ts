import type { RowProps } from 'ant-design-vue'
import { Row } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/utils/index.common'

const SmRow = createWrappedComponent<RowProps>(Row, 'row')

export default SmRow
