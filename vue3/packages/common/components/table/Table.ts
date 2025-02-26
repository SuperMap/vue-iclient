import type { TableProps } from 'ant-design-vue'
import { Table as ATable } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmTable = createWrappedComponent<TableProps>(ATable)

export default SmTable
