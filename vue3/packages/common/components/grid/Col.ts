import type { ColProps } from 'ant-design-vue'
import { Col } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmCol = createWrappedComponent<ColProps>(Col, 'col')

export default SmCol
