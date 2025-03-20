import type { PropType } from 'vue'
import type { TableProps } from 'ant-design-vue'
import type { ThemeProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults, themeProps } from '@supermapgis/common/utils/index.common'

export interface AttributeRecord {
  title: string
  value: any
}

export type ColumnCustomRender = TableProps['columns'][number]['customRender']

export const attributePanelProps = () => ({
  title: {
    type: String
  },
  showBorder: {
    type: Boolean,
    default: true
  },
  titleRender: {
    type: Function as PropType<ColumnCustomRender>
  },
  valueRender: {
    type: Function as PropType<ColumnCustomRender>
  },
  attributes: {
    type: Array as PropType<AttributeRecord[]>,
    default: () => []
  }
})

// export type AttributePanelProps = Partial<ExtractPropTypes<ReturnType<typeof attributePanelProps>>>
export interface AttributePanelProps extends ThemeProps {
  showBorder?: boolean
  attributes?: AttributeRecord[]
  title?: string
  titleRender?: ColumnCustomRender
  valueRender?: ColumnCustomRender
}

export const attributePanelPropsDefault = getPropsDefaults<AttributePanelProps>(
  Object.assign(themeProps(), attributePanelProps())
)

export default attributePanelProps
