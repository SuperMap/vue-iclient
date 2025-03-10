import type { TableProps } from 'ant-design-vue'
import { Table } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

const SmTable = createWrappedComponent<TableProps>(Table, 'table')

export default SmTable
