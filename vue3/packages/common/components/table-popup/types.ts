import type { PropType } from 'vue'
import type { TableProps } from 'ant-design-vue'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults, themeProps } from '@supermapgis/common/utils/index.common'

export type TableData = TableProps['dataSource']

export type TableColumns = TableProps['columns']

export const tablePopupProps = () => ({
  data: {
    type: Array as PropType<TableData>,
    default: () => []
  },
  columns: {
    type: Array as PropType<TableColumns>,
    default: () => []
  },
  splitLine: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  }
})

// export type TablePopupProps = Partial<ExtractPropTypes<ReturnType<typeof tablePopupProps>>>
export interface TablePopupProps extends ThemeProps {
  data?: TableData
  columns?: TableColumns
  showHeader?: boolean
  splitLine?: boolean
}

export const tablePopupPropsDefault = getPropsDefaults<TablePopupProps>(
  Object.assign(themeProps(), tablePopupProps())
)

export default tablePopupProps
