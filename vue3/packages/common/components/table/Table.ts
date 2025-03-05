import type { TableProps } from 'ant-design-vue'
import { Table } from 'ant-design-vue'
import { createWrappedComponent } from '@supermapgis/common/components/theme/antd-wrapper'

// @ts-ignore
const SmTable = createWrappedComponent<TableProps>(Table)

export default SmTable
